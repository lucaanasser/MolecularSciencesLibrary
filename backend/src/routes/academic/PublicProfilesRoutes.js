const express = require('express');
const router = express.Router();
const publicProfilesController = require('../../controllers/academic/PublicProfilesController');
const authenticateToken = require('../../middlewares/authenticateToken');
const verifyProfileOwnership = require('../../middlewares/verifyProfileOwnership');
const { upload } = require('../../utils/imageUpload');

console.log('🔵 [PublicProfilesRoutes] Configurando rotas de perfis públicos');

// ==================== PROFILE MAIN ====================

// Get complete public profile (PUBLIC - no auth required)
router.get('/:userId', (req, res) => {
    publicProfilesController.getProfile(req, res);
});

// Update main profile info (PROTECTED - ownership required)
router.put('/:userId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.updateProfile(req, res);
});

// Update profile banner choice (PROTECTED - ownership required)
router.put('/:userId/banner', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.updateBanner(req, res);
});

// Upload profile avatar (PROTECTED - ownership required)
router.put('/:userId/avatar', authenticateToken, verifyProfileOwnership, upload.single('image'), (req, res) => {
    publicProfilesController.uploadAvatar(req, res);
});

// Select default avatar (PROTECTED - ownership required)
router.put('/:userId/avatar/default', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.selectDefaultAvatar(req, res);
});

// ==================== ADVANCED CYCLES ====================

// Create advanced cycle (PROTECTED - ownership required)
router.post('/:userId/advanced-cycles', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.createAdvancedCycle(req, res);
});

// Update advanced cycle (PROTECTED - ownership required)
router.put('/:userId/advanced-cycles/:cycleId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.updateAdvancedCycle(req, res);
});

// Delete advanced cycle (PROTECTED - ownership required)
router.delete('/:userId/advanced-cycles/:cycleId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.deleteAdvancedCycle(req, res);
});

// Add tag to advanced cycle (PROTECTED - ownership required)
router.post('/:userId/advanced-cycles/:cycleId/tags', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.addCycleTag(req, res);
});

// Remove tag from advanced cycle (PROTECTED - ownership required)
router.delete('/:userId/advanced-cycles/:cycleId/tags/:tagId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.removeCycleTag(req, res);
});

// ==================== DISCIPLINES ====================

// Create discipline (PROTECTED - ownership required)
router.post('/:userId/disciplines', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.createDiscipline(req, res);
});

// Update discipline (PROTECTED - ownership required)
router.put('/:userId/disciplines/:discId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.updateDiscipline(req, res);
});

// Delete discipline (PROTECTED - ownership required)
router.delete('/:userId/disciplines/:discId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.deleteDiscipline(req, res);
});

// ==================== INTERNATIONAL EXPERIENCES ====================

// Create international experience (PROTECTED - ownership required)
router.post('/:userId/international', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.createInternational(req, res);
});

// Update international experience (PROTECTED - ownership required)
router.put('/:userId/international/:expId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.updateInternational(req, res);
});

// Delete international experience (PROTECTED - ownership required)
router.delete('/:userId/international/:expId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.deleteInternational(req, res);
});

// ==================== POST-CM ====================

// Create post-CM entry (PROTECTED - ownership required)
router.post('/:userId/post-cm', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.createPostCM(req, res);
});

// Update post-CM entry (PROTECTED - ownership required)
router.put('/:userId/post-cm/:postId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.updatePostCM(req, res);
});

// Delete post-CM entry (PROTECTED - ownership required)
router.delete('/:userId/post-cm/:postId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.deletePostCM(req, res);
});

// Add area to post-CM (PROTECTED - ownership required)
router.post('/:userId/post-cm/:postId/areas', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.addPostCMArea(req, res);
});

// Remove area from post-CM (PROTECTED - ownership required)
router.delete('/:userId/post-cm/:postId/areas/:areaId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.removePostCMArea(req, res);
});

// ==================== PROFILE TAGS ====================

// Add tag to profile (PROTECTED - ownership required)
router.post('/:userId/tags', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.addProfileTag(req, res);
});

// Remove tag from profile (PROTECTED - ownership required)
router.delete('/:userId/tags/:tagId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.removeProfileTag(req, res);
});

// ==================== FOLLOWS ====================

// Follow a user (PROTECTED - authenticated user required)
router.post('/:userId/follow/:targetId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.followUser(req, res);
});

// Unfollow a user (PROTECTED - authenticated user required)
router.delete('/:userId/follow/:targetId', authenticateToken, verifyProfileOwnership, (req, res) => {
    publicProfilesController.unfollowUser(req, res);
});

// Get list of users being followed (PUBLIC)
router.get('/:userId/following', (req, res) => {
    publicProfilesController.getFollowing(req, res);
});

// Get list of followers (PUBLIC)
router.get('/:userId/followers', (req, res) => {
    publicProfilesController.getFollowers(req, res);
});

// Check if user is following another user (PUBLIC)
router.get('/:userId/follow/:targetId/status', (req, res) => {
    publicProfilesController.checkIsFollowing(req, res);
});

console.log('🟢 [PublicProfilesRoutes] Rotas configuradas com sucesso');

module.exports = router;
