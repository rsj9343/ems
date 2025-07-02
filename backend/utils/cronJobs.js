import cron from 'node-cron';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from './emailService.js';

// Birthday reminders - runs daily at 9 AM
export const birthdayReminders = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running birthday reminder job...');
    
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    // Find employees with birthdays today
    const birthdayEmployees = await Employee.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$dateOfBirth' }, todayMonth] },
          { $eq: [{ $dayOfMonth: '$dateOfBirth' }, todayDate] }
        ]
      }
    }).populate('user');

    for (const employee of birthdayEmployees) {
      // Send email if employee has email
      if (employee.email) {
        const template = emailTemplates.birthdayReminder(employee.name, employee.dateOfBirth);
        await sendEmail(employee.email, template.subject, template.html);
      }

      // Create notification for the employee if they have a user account
      if (employee.user) {
        await Notification.create({
          recipient: employee.user._id,
          type: 'birthday_reminder',
          title: '🎉 Happy Birthday!',
          message: 'Wishing you a wonderful birthday filled with happiness and joy!',
          priority: 'medium'
        });
      }

      // Notify HR/Admin about the birthday
      const adminUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
      for (const admin of adminUsers) {
        await Notification.create({
          recipient: admin._id,
          type: 'birthday_reminder',
          title: `🎂 ${employee.name}'s Birthday`,
          message: `Today is ${employee.name}'s birthday. Consider sending them wishes!`,
          priority: 'low',
          data: { employeeId: employee._id }
        });
      }
    }

    console.log(`Birthday reminders sent for ${birthdayEmployees.length} employees`);
  } catch (error) {
    console.error('Birthday reminder job error:', error);
  }
}, {
  scheduled: false
});

// Work anniversary reminders - runs daily at 9 AM
export const workAnniversaryReminders = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running work anniversary reminder job...');
    
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    // Find employees with work anniversaries today
    const anniversaryEmployees = await Employee.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$dateOfJoining' }, todayMonth] },
          { $eq: [{ $dayOfMonth: '$dateOfJoining' }, todayDate] },
          { $ne: [{ $year: '$dateOfJoining' }, { $year: new Date() }] } // Not their first day
        ]
      }
    }).populate('user');

    for (const employee of anniversaryEmployees) {
      const yearsOfService = today.getFullYear() - new Date(employee.dateOfJoining).getFullYear();

      // Send email if employee has email
      if (employee.email) {
        const template = emailTemplates.workAnniversary(employee.name, yearsOfService);
        await sendEmail(employee.email, template.subject, template.html);
      }

      // Create notification for the employee if they have a user account
      if (employee.user) {
        await Notification.create({
          recipient: employee.user._id,
          type: 'work_anniversary',
          title: `🎊 ${yearsOfService} Year Work Anniversary!`,
          message: `Congratulations on ${yearsOfService} years with the company!`,
          priority: 'medium'
        });
      }

      // Notify HR/Admin about the anniversary
      const adminUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
      for (const admin of adminUsers) {
        await Notification.create({
          recipient: admin._id,
          type: 'work_anniversary',
          title: `🎊 ${employee.name}'s Work Anniversary`,
          message: `Today marks ${yearsOfService} years of ${employee.name} with the company!`,
          priority: 'low',
          data: { employeeId: employee._id, years: yearsOfService }
        });
      }
    }

    console.log(`Work anniversary reminders sent for ${anniversaryEmployees.length} employees`);
  } catch (error) {
    console.error('Work anniversary reminder job error:', error);
  }
}, {
  scheduled: false
});

// Clean up old notifications - runs daily at midnight
export const cleanupNotifications = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running notification cleanup job...');
    
    // Delete notifications older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('Notification cleanup job error:', error);
  }
}, {
  scheduled: false
});

// Start all cron jobs
export const startCronJobs = () => {
  birthdayReminders.start();
  workAnniversaryReminders.start();
  cleanupNotifications.start();
  console.log('All cron jobs started');
};

// Stop all cron jobs
export const stopCronJobs = () => {
  birthdayReminders.stop();
  workAnniversaryReminders.stop();
  cleanupNotifications.stop();
  console.log('All cron jobs stopped');
};