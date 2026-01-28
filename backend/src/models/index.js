import User from './User.js';
import Project from './Project.js';
import Objective from './Objective.js';
import Phase from './Phase.js';
import Milestone from './Milestone.js';
import Task from './Task.js';
import Checkin from './Checkin.js';
import ProgressLog from './ProgressLog.js';
import WeeklyReview from './WeeklyReview.js';
import PlanIteration from './PlanIteration.js';

User.hasMany(Project, { foreignKey: 'userId' });
Project.belongsTo(User, { foreignKey: 'userId' });

Project.hasMany(Objective, { foreignKey: 'projectId' });
Objective.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Phase, { foreignKey: 'projectId' });
Phase.belongsTo(Project, { foreignKey: 'projectId' });

Phase.hasMany(Milestone, { foreignKey: 'phaseId' });
Milestone.belongsTo(Phase, { foreignKey: 'phaseId' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });
Phase.hasMany(Task, { foreignKey: 'phaseId' });
Task.belongsTo(Phase, { foreignKey: 'phaseId' });
Milestone.hasMany(Task, { foreignKey: 'milestoneId' });
Task.belongsTo(Milestone, { foreignKey: 'milestoneId' });

Task.hasMany(ProgressLog, { foreignKey: 'taskId' });
ProgressLog.belongsTo(Task, { foreignKey: 'taskId' });
User.hasMany(ProgressLog, { foreignKey: 'userId' });
ProgressLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Checkin, { foreignKey: 'userId' });
Checkin.belongsTo(User, { foreignKey: 'userId' });
Project.hasMany(Checkin, { foreignKey: 'projectId' });
Checkin.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(WeeklyReview, { foreignKey: 'userId' });
WeeklyReview.belongsTo(User, { foreignKey: 'userId' });
Project.hasMany(WeeklyReview, { foreignKey: 'projectId' });
WeeklyReview.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(PlanIteration, { foreignKey: 'userId' });
PlanIteration.belongsTo(User, { foreignKey: 'userId' });
Project.hasMany(PlanIteration, { foreignKey: 'projectId' });
PlanIteration.belongsTo(Project, { foreignKey: 'projectId' });

export {
  User,
  Project,
  Objective,
  Phase,
  Milestone,
  Task,
  ProgressLog,
  Checkin,
  WeeklyReview,
  PlanIteration,
};
