import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { performanceService } from '../../services/performanceService';
import { TrendingUp, Plus, Eye, Edit, Trash2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../Common/Card';
import Button from '../Common/Button';
import DataTable from '../Common/DataTable';
import toast from 'react-hot-toast';

const PerformanceList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await performanceService.getAll(filters);
      setReviews(response.reviews);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total
      });
    } catch (error) {
      toast.error('Failed to fetch performance reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this performance review?')) return;
    
    try {
      await performanceService.delete(id);
      fetchReviews();
      toast.success('Performance review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete performance review');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending_employee_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRating = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating}/5</span>
    </div>
  );

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {value.name.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{value.name}</div>
            <div className="text-sm text-gray-500">{value.employeeId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'position',
      label: 'Position',
      render: (value: any, row: any) => row.employee.position
    },
    {
      key: 'reviewPeriod',
      label: 'Review Period',
      render: (value: any) => (
        <div className="text-sm">
          {format(new Date(value.startDate), 'MMM dd')} - {format(new Date(value.endDate), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'overallRating',
      label: 'Rating',
      sortable: true,
      render: (value: number) => renderRating(value)
    },
    {
      key: 'reviewer',
      label: 'Reviewer',
      render: (value: any) => value.name
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-3">
          <Link
            to={`/performance/${row._id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {isAdmin && (
            <>
              <Link
                to={`/performance/${row._id}/edit`}
                className="text-green-600 hover:text-green-900"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={() => deleteReview(row._id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Reviews</h1>
            <p className="text-gray-600">Track and manage employee performance</p>
          </div>
        </div>
        {isAdmin && (
          <Link to="/performance/new">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Review</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_employee_review">Pending Review</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </Card>

      {/* Performance Reviews Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={reviews}
          loading={loading}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            total: pagination.total,
            onPageChange: handlePageChange
          }}
          sorting={{
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
            onSort: handleSort
          }}
          emptyMessage="No performance reviews found"
        />
      </Card>
    </div>
  );
};

export default PerformanceList;