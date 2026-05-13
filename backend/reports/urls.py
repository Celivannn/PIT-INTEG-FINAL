from django.urls import path
from .views import DashboardKPIView, AdminCustomerListView, AdminCustomerDetailView, ReportExportView

urlpatterns = [
    path('dashboard/',           DashboardKPIView.as_view(),        name='admin-dashboard'),
    path('customers/',           AdminCustomerListView.as_view(),    name='admin-customers'),
    path('customers/<int:pk>/',  AdminCustomerDetailView.as_view(),  name='admin-customer-detail'),
    path('reports/export/',      ReportExportView.as_view(),         name='reports-export'),
]
