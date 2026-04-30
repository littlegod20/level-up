/**
 * OpenAPI path definitions (merged by swagger-jsdoc from `apis` in swagger.config).
 *
 * @openapi
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       "201":
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     email: { type: string }
 *       "409":
 *         description: Email already registered
 *
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     email: { type: string }
 *       "401":
 *         description: Invalid credentials
 *
 * @openapi
 * /api/habits:
 *   get:
 *     tags: [Habits]
 *     summary: List habits for the current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       "200":
 *         description: List of habits
 *   post:
 *     tags: [Habits]
 *     summary: Create a habit
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, icon, color, frequency, xpReward]
 *             properties:
 *               name: { type: string }
 *               icon: { type: string }
 *               color: { type: string }
 *               frequency: { type: string, enum: [daily, weekly, custom] }
 *               customWeekdays: { type: array, items: { type: integer } }
 *               reminderTime: { type: string, nullable: true }
 *               xpReward: { type: integer }
 *               archived: { type: boolean }
 *     responses:
 *       "201":
 *         description: Created
 *
 * @openapi
 * /api/habits/{habitId}:
 *   get:
 *     tags: [Habits]
 *     summary: Get one habit
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       "200": { description: OK }
 *       "404": { description: Not found }
 *   patch:
 *     tags: [Habits]
 *     summary: Update a habit
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       "200": { description: OK }
 *   delete:
 *     tags: [Habits]
 *     summary: Delete a habit
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       "204": { description: No content }
 *
 * @openapi
 * /api/habits/{habitId}/completions:
 *   get:
 *     tags: [Completions]
 *     summary: List completions for a habit
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-01-01" }
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-01-31" }
 *     responses:
 *       "200": { description: OK }
 *   post:
 *     tags: [Completions]
 *     summary: Log a completion
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date]
 *             properties:
 *               date: { type: string, example: "2026-04-08" }
 *               skipped: { type: boolean }
 *               note: { type: string, nullable: true }
 *     responses:
 *       "201": { description: Created }
 *       "409": { description: Already completed for that date }
 *
 * @openapi
 * /api/habits/{habitId}/completions/{date}:
 *   delete:
 *     tags: [Completions]
 *     summary: Remove a completion (uncomplete)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: "2026-04-08" }
 *     responses:
 *       "204": { description: No content }
 */

export {};
