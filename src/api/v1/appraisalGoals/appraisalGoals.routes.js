import Express from "express";
import appraisalGoalsController from "../appraisalGoals/appraisalGoals.controller.js";
import multer from "multer";
import authentication from "../../../middleware/authentication.js";
import authorization from "../../../middleware/authorization.js";
const upload = multer({ dest: "uploads/excel/" });

export default Express.Router()
	.post("/createGoalPlan", appraisalGoalsController.createGoalPlan)
	.get("/goalPlanList", appraisalGoalsController.goalPlanList)
	.get("/goalAttributesList", appraisalGoalsController.goalAttributesList)
	.get("/subGoalAttributesList", appraisalGoalsController.subGoalAttributesList)
	.post("/editGoalPlan", appraisalGoalsController.editGoalPlan)
	.post("/activeGoalPlan", appraisalGoalsController.activeGoalPlan)
	.post("/archiveGoalPlan", appraisalGoalsController.archiveGoalPlan)
	.post("/deleteGoalPlan", appraisalGoalsController.deleteGoalPlan)
	.get(
		"/goalActiveAndArchive",
		authentication.authenticate,
		appraisalGoalsController.goalActiveAndArchive,
	)
	.get("/getGoalPlanDetails", appraisalGoalsController.getGoalPlanDetails)
	.post(
		"/addGoalKeyAreaByUser",
		authentication.authenticate,
		appraisalGoalsController.addGoalKeyAreaByUser,
	)
	.get(
		"/getGoalAreaForUser",
		authentication.authenticate,
		appraisalGoalsController.getGoalAreaForUser,
	)
	.get(
		"/performanceOverview",
		authentication.authenticate,
		appraisalGoalsController.performanceOverview,
	)
	.post(
		"/editGoalKeyAreaByUser",
		authentication.authenticate,
		appraisalGoalsController.editGoalKeyAreaByUser,
	)
	.post(
		"/deleteGoalKeyAreaByUser",
		authentication.authenticate,
		appraisalGoalsController.deleteGoalKeyAreaByUser,
	)
	.get(
		"/getPreviousGoalAreaForUser",
		authentication.authenticate,
		appraisalGoalsController.getPreviousGoalAreaForUser,
	)
	.post(
		"/addGoalsFromPreviousGolas",
		authentication.authenticate,
		appraisalGoalsController.addGoalsFromPreviousGolas,
	)
	.post(
		"/submitGoals",
		authentication.authenticate,
		appraisalGoalsController.submitGoals,
	)
	.get(
		"/getPendingGoalsList",
		authentication.authenticate,
		appraisalGoalsController.getPendingGoalsList,
	)
	.get(
		"/getPendingGoalDetails",
		authentication.authenticate,
		appraisalGoalsController.getPendingGoalDetails,
	)
	.post(
		"/pragatiGoalApproval",
		authentication.authenticate,
		appraisalGoalsController.pragatiGoalApproval,
	)
	.post(
		"/recallGoals",
		authentication.authenticate,
		appraisalGoalsController.recallGoals,
	)
	.post(
		"/createReviewFramework",
		authentication.authenticate,
		appraisalGoalsController.createReviewFramework,
	)
	.get(
		"/reviewAppraisal",
		authentication.authenticate,
		appraisalGoalsController.reviewAppraisal,
	)
	.get(
		"/getReviewFrameworks",
		authentication.authenticate,
		appraisalGoalsController.getReviewFrameworks,
	)
	.post(
		"/updateReviewFramework",
		authentication.authenticate,
		appraisalGoalsController.updateReviewFramework,
	)
	.post(
		"/selfRatingCopy",
		authentication.authenticate,
		appraisalGoalsController.selfRatingCopy,
	)
	.post(
		"/activeGoalReviewFramework",
		appraisalGoalsController.activeGoalReviewFramework,
	)
	.post(
		"/archiveGoalReviewFramework",
		appraisalGoalsController.archiveGoalReviewFramework,
	)
	.post("/createRatingScale", appraisalGoalsController.createRatingScale)
	.get("/getAllRatingScales", appraisalGoalsController.getAllRatingScales)
	.post("/updateRatingScale", appraisalGoalsController.updateRatingScale)
	.post("/createCompentancy", appraisalGoalsController.createCompentancy)
	.post("/updateCompentancy", appraisalGoalsController.updateCompentancy)
	.post(
		"/addCompetencyAttributes",
		appraisalGoalsController.addCompetencyAttributes,
	)
	.get("/getAllCompetencyTiers", appraisalGoalsController.getAllCompetencyTiers)
	.get(
		"/getAllCompetencyAttributesWithTier",
		appraisalGoalsController.getAllCompetencyAttributesWithTier,
	)
	.post(
		"/updateCompetencyAttributes",
		appraisalGoalsController.updateCompetencyAttributes,
	)
	.get(
		"/getReportieReviewAppraisal",
		authentication.authenticate,
		appraisalGoalsController.getReportieReviewAppraisal,
	)
	.post(
		"/sendBackForSubmission",
		authentication.authenticate,
		appraisalGoalsController.sendBackForSubmission,
	).post(
		"/selfRating",
		authentication.authenticate,
		appraisalGoalsController.selfRating,
	);;
