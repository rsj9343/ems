import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { performanceService } from '../../services/performanceService';
import { employeeService } from '../../services/employeeService';
import { TrendingUp, ArrowLeft, Save, Plus, Trash2, Star } from 'lucide-react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

interface PerformanceFormData {
  employee: string;
  reviewer: string;
  reviewPeriod: {
    startDate: string;
    endDate: string;
  };
  overallRating: number;
  categories: Array<{
    name: string;
    rating: number;
    comments: string;
  }>;
  goals: Array<{
    description: string;
    status: string;
    dueDate: string;
  }>;
  achievements: string[];
  areasForImprovement: string[];
  developmentPlan: Array<{
    skill: string;
    action: string;
    timeline: string;
    resources: string[];
  }>;
  employeeComments: string;
  reviewerComments: string;
  status: string;
  nextReviewDate: string;
}

const PerformanceForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<PerformanceFormData>({
    defaultValues: {
      categories: [
        { name: 'Communication', rating: 3, comments: '' },
        { name: 'Technical Skills', rating: 3, comments: '' },
        { name: 'Teamwork', rating: 3, comments: '' },
        { name: 'Leadership', rating: 3, comments: '' },
        { name: 'Problem Solving', rating: 3, comments: '' }
      ],
      goals: [{ description: '', status: 'not_started', dueDate: '' }],
      achievements: [''],
      areasForImprovement: [''],
      developmentPlan: [{ skill: '', action: '', timeline: '', resources: [''] }]
    }
  });

  const { fields: categoryFields } = useFieldArray({
    control,
    name: 'categories'
  });

  const { fields: goalFields, append: appendGoal, remove: removeGoal } = useFieldArray({
    control,
    name: 'goals'
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control,
    name: 'achievements'
  });

  const { fields: improvementFields, append: appendImprovement, remove: removeImprovement } = useFieldArray({
    control,
    name: 'areasForImprovement'
  });

  const { fields: developmentFields, append: appendDevelopment, remove: removeDevelopment } = useFieldArray({
    control,
    name: 'developmentPlan'
  });

  useEffect(() => {
    fetchEmployees();
    if (isEditing) {
      fetchPerformanceReview();
    }
  }, [id, isEditing]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll({ limit: 100 });
      setEmployees(response.employees);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchPerformanceReview = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await performanceService.getById(id);
      const review = response.review;
      
      reset({
        ...review,
        employee: review.employee._id,
        reviewer: review.reviewer._id,
        reviewPeriod: {
          startDate: new Date(review.reviewPeriod.startDate).toISOString().split('T')[0],
          endDate: new Date(review.reviewPeriod.endDate).toISOString().split('T')[0]
        },
        nextReviewDate: review.nextReviewDate ? new Date(review.nextReviewDate).toISOString().split('T')[0] : '',
        goals: review.goals.map((goal: any) => ({
          ...goal,
          dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : ''
        }))
      });
    } catch (error) {
      toast.error('Failed to fetch performance review');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PerformanceFormData) => {
    try {
      setSubmitting(true);
      
      if (isEditing && id) {
        await performanceService.update(id, data);
        toast.success('Performance review updated successfully');
      } else {
        await performanceService.create(data);
        toast.success('Performance review created successfully');
      }
      
      navigate('/performance');
    } catch (error) {
      toast.error('Failed to save performance review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (fieldName: string, currentRating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => setValue(fieldName as any, rating)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              rating <= currentRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">{currentRating}/5</span>
    </div>
  );

  if (loading) {
    return <LoadingSpinner text="Loading performance review..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate('/performance')}
          variant="outline"
          size="small"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Performance Review' : 'New Performance Review'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update performance review details' : 'Create a new performance review'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <select
                {...register('employee', { required: 'Employee is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
              {errors.employee && (
                <p className="mt-1 text-sm text-red-600">{errors.employee.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviewer *
              </label>
              <select
                {...register('reviewer', { required: 'Reviewer is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Reviewer</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
              {errors.reviewer && (
                <p className="mt-1 text-sm text-red-600">{errors.reviewer.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Period Start *
              </label>
              <input
                {...register('reviewPeriod.startDate', { required: 'Start date is required' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.reviewPeriod?.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.reviewPeriod.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Period End *
              </label>
              <input
                {...register('reviewPeriod.endDate', { required: 'End date is required' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.reviewPeriod?.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.reviewPeriod.endDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              {renderStarRating('overallRating', watch('overallRating') || 3)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="pending_employee_review">Pending Employee Review</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Performance Categories */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Categories</h3>
          <div className="space-y-4">
            {categoryFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    {...register(`categories.${index}.name`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  {renderStarRating(`categories.${index}.rating`, watch(`categories.${index}.rating`) || 3)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </label>
                  <textarea
                    {...register(`categories.${index}.comments`)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Goals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Goals</h3>
            <Button
              type="button"
              onClick={() => appendGoal({ description: '', status: 'not_started', dueDate: '' })}
              variant="outline"
              size="small"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>
          <div className="space-y-4">
            {goalFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register(`goals.${index}.description`)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register(`goals.${index}.status`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="exceeded">Exceeded</option>
                  </select>
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      {...register(`goals.${index}.dueDate`)}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeGoal(index)}
                    variant="outline"
                    size="small"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Achievements</h3>
            <Button
              type="button"
              onClick={() => appendAchievement('')}
              variant="outline"
              size="small"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </div>
          <div className="space-y-3">
            {achievementFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-3">
                <textarea
                  {...register(`achievements.${index}`)}
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe an achievement..."
                />
                <Button
                  type="button"
                  onClick={() => removeAchievement(index)}
                  variant="outline"
                  size="small"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Areas for Improvement</h3>
            <Button
              type="button"
              onClick={() => appendImprovement('')}
              variant="outline"
              size="small"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Area
            </Button>
          </div>
          <div className="space-y-3">
            {improvementFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-3">
                <textarea
                  {...register(`areasForImprovement.${index}`)}
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe an area for improvement..."
                />
                <Button
                  type="button"
                  onClick={() => removeImprovement(index)}
                  variant="outline"
                  size="small"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Comments */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Comments
              </label>
              <textarea
                {...register('employeeComments')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Employee's self-assessment and comments..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviewer Comments
              </label>
              <textarea
                {...register('reviewerComments')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Reviewer's overall assessment and feedback..."
              />
            </div>
          </div>
        </Card>

        {/* Next Review Date */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Next Review</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Review Date
            </label>
            <input
              {...register('nextReviewDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/performance')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : isEditing ? 'Update Review' : 'Create Review'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PerformanceForm;