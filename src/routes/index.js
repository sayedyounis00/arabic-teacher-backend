'use strict';

const express = require('express');
const authRoutes = require('./auth.routes');
const yearsRoutes = require('./years.routes');
const coursesRoutes = require('./courses.routes');
const lessonsRoutes = require('./lessons.routes');
const enrollmentsRoutes = require('./enrollments.routes');
const lessonAccessRoutes = require('./lessonAccess.routes');
const examsRoutes = require('./exams.routes');
const progressRoutes = require('./progress.routes');
const courseRequestsRoutes = require('./courseRequests.routes');
const profilesRoutes = require('./profiles.routes');
const complaintsRoutes = require('./complaints.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/years', yearsRoutes);
router.use('/courses', coursesRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/enrollments', enrollmentsRoutes);
router.use('/lesson-access', lessonAccessRoutes);
router.use('/exams', examsRoutes);
router.use('/progress', progressRoutes);
router.use('/course-requests', courseRequestsRoutes);
router.use('/profiles', profilesRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/users', userRoutes);

module.exports = router;

