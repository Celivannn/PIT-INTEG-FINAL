import csv
import io
from datetime import date
from django.http import HttpResponse
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from users.permissions import IsAdmin
from reservations.models import Reservation
from rooms.models import Room
from django.contrib.auth import get_user_model

User = get_user_model()


def get_date_range(request):
    date_from = request.query_params.get('date_from', date.today().replace(day=1).isoformat())
    date_to   = request.query_params.get('date_to',   date.today().isoformat())
    return date_from, date_to


# ─── KPI Dashboard ────────────────────────────────────────────────────────────

class DashboardKPIView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        date_from, date_to = get_date_range(request)

        reservations = Reservation.objects.filter(
            created_at__date__gte=date_from,
            created_at__date__lte=date_to,
        )

        total_bookings = reservations.count()
        total_revenue  = reservations.filter(
            status__in=['confirmed', 'checked_in', 'checked_out']
        ).aggregate(total=Sum('total_price'))['total'] or 0

        total_rooms    = Room.objects.filter(status__in=['available', 'occupied']).count()
        occupied_rooms = Room.objects.filter(status='occupied').count()
        occupancy_rate = round((occupied_rooms / total_rooms * 100), 1) if total_rooms else 0

        total_customers = User.objects.filter(role='customer').count()

        monthly = (
            Reservation.objects
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'), revenue=Sum('total_price'))
            .order_by('-month')[:6]
        )

        status_breakdown = (
            reservations.values('status')
            .annotate(count=Count('id'))
        )

        return Response({
            'period':           {'from': date_from, 'to': date_to},
            'total_bookings':   total_bookings,
            'total_revenue':    float(total_revenue),
            'occupancy_rate':   occupancy_rate,
            'total_customers':  total_customers,
            'monthly_trend':    list(monthly),
            'status_breakdown': list(status_breakdown),
        })


# ─── Customer Management ──────────────────────────────────────────────────────

class AdminCustomerListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        customers = User.objects.filter(role='customer').annotate(
            total_reservations=Count('reservations'),
            total_spent=Sum('reservations__total_price'),
        ).order_by('-total_reservations')

        data = [{
            'id':                 c.id,
            'email':              c.email,
            'full_name':          c.full_name,
            'phone':              c.phone,
            'created_at':         c.created_at,
            'total_reservations': c.total_reservations,
            'total_spent':        float(c.total_spent or 0),
        } for c in customers]

        return Response(data)


class AdminCustomerDetailView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        try:
            customer = User.objects.get(pk=pk, role='customer')
        except User.DoesNotExist:
            return Response({'detail': 'Customer not found.'}, status=404)

        reservations = Reservation.objects.filter(user=customer).select_related(
            'room', 'room__room_type'
        ).order_by('-created_at')

        from reservations.serializers import AdminReservationSerializer
        return Response({
            'id':           customer.id,
            'email':        customer.email,
            'full_name':    customer.full_name,
            'phone':        customer.phone,
            'created_at':   customer.created_at,
            'reservations': AdminReservationSerializer(reservations, many=True).data,
        })


# ─── Reports Export ───────────────────────────────────────────────────────────

class ReportExportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        # ── debug prints (remove after confirming it works) ──
        print('=== REPORT EXPORT HIT ===')
        print('User:', request.user)
        print('Authenticated:', request.user.is_authenticated)
        print('Is admin:', getattr(request.user, 'is_admin', 'NO ATTR'))
        print('Auth header:', request.META.get('HTTP_AUTHORIZATION', 'MISSING'))
        # ─────────────────────────────────────────────────────

        fmt       = request.query_params.get('format', 'csv')
        report    = request.query_params.get('report', 'bookings')
        date_from, date_to = get_date_range(request)

        qs = Reservation.objects.filter(
            created_at__date__gte=date_from,
            created_at__date__lte=date_to,
        ).select_related('user', 'room', 'room__room_type').order_by('-created_at')

        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        if fmt == 'pdf':
            return self._export_pdf(qs, date_from, date_to, report)
        return self._export_csv(qs, date_from, date_to)

    def _export_csv(self, qs, date_from, date_to):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = (
            f'attachment; filename="bookings_{date_from}_{date_to}.csv"'
        )
        writer = csv.writer(response)
        writer.writerow([
            'Booking Ref', 'Customer Email', 'Customer Name',
            'Room', 'Room Type', 'Check In', 'Check Out',
            'Nights', 'Guests', 'Price/Night', 'Total Price', 'Status', 'Created At'
        ])
        for r in qs:
            writer.writerow([
                r.booking_ref, r.user.email, r.user.full_name,
                r.room.room_number, r.room.room_type.name,  # fixed: was get_name_display()
                r.check_in, r.check_out,
                r.nights, r.guests,
                r.price_per_night, r.total_price,
                r.get_status_display(), r.created_at.strftime('%Y-%m-%d %H:%M'),
            ])
        return response

    def _export_pdf(self, qs, date_from, date_to, report):
        buffer   = io.BytesIO()
        doc      = SimpleDocTemplate(buffer, pagesize=A4)
        styles   = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph(f'Booking Report: {date_from} to {date_to}', styles['Title']))
        elements.append(Spacer(1, 12))

        headers = ['Booking Ref', 'Customer', 'Room', 'Check In', 'Check Out', 'Total', 'Status']
        rows    = [headers]
        for r in qs:
            rows.append([
                r.booking_ref,
                r.user.full_name,
                r.room.room_number,
                str(r.check_in),
                str(r.check_out),
                f'PHP {r.total_price:,.2f}',
                r.get_status_display(),
            ])

        table = Table(rows, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1d4ed8')),
            ('TEXTCOLOR',  (0, 0), (-1, 0), colors.white),
            ('FONTNAME',   (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f1f5f9')]),
            ('GRID',       (0, 0), (-1, -1), 0.25, colors.grey),
            ('ALIGN',      (0, 0), (-1, -1), 'LEFT'),
            ('PADDING',    (0, 0), (-1, -1), 6),
        ]))
        elements.append(table)
        doc.build(elements)

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="bookings_{date_from}_{date_to}.pdf"'
        )
        return response