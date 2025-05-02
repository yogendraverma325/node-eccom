import validator from "../../../helper/validator.js";
import db from "../../../config/db.config.js";
import helper from "../../../helper/helper.js";
import respHelper from "../../../helper/respHelper.js";
import constant from "../../../constant/messages.js";
import bcrypt from "bcryptjs";
import moment from "moment";
import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";
class AuthController {
	async login(req, res) {
		try {
			const result = await validator.loginSchema.validateAsync(req.body);

			let dataRes = null;
			if (parseInt(process.env.TEST) === 0) {
				const formData = new FormData();
				formData.append("uname", result.tmc);
				formData.append("pass", result.password);
				dataRes = await axios({
					method: "post",
					url: "https://wap.teamcomputers.com/emaauth/api/AD/Validatelogin",
					data: formData,
				});
			}

			const existUser = await db.employeeMaster.findOne({
				where: { empCode: result.tmc, isActive: 1 },
				include: [
					{
						model: db.roleMaster,
						attributes: ["role_id", "name"],
					},
					{
						model: db.designationMaster,
						attributes: ["designationId", "name"],
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "companyLogo"],
					},
				],
			});

			if (!existUser) {
				return respHelper(res, {
					status: 404,
					msg: constant.USER_NOT_EXIST,
				});
			}

			if (!existUser.dataValues.isLoginActive) {
				return respHelper(res, {
					status: 404,
					msg: constant.LOGIN_BLOCKED,
				});
			}

			if (
				existUser.dataValues.wrongPasswordCount ===
				parseInt(process.env.WRONG_PASSWORD_LIMIT)
			) {
				return respHelper(res, {
					status: 404,
					msg: constant.ACCOUNT_LOCKED,
				});
			}

			if (
				existUser.dataValues.passwordExpiryDate &&
				moment().isSameOrAfter(existUser.dataValues.passwordExpiryDate)
			) {
				return respHelper(res, {
					status: 400,
					msg: constant.PASSWORD_EXPIRED,
				});
			}

			if (!dataRes?.data?.status) {
				const comparePass = await bcrypt.compare(
					result.password,
					existUser.password,
				);

				if (!comparePass) {
					await db.employeeMaster.update(
						Object.assign(
							{
								wrongPasswordCount: existUser.dataValues.wrongPasswordCount + 1,
							},
							existUser.dataValues.wrongPasswordCount === 2
								? {
										accountRecoveryTime: moment().add(
											parseInt(process.env.ACCOUNT_RECOVERY_TIME),
											"minutes",
										),
									}
								: null,
						),
						{
							where: {
								id: existUser.dataValues.id,
							},
						},
					);

					if (
						existUser.dataValues.wrongPasswordCount ===
						parseInt(process.env.WRONG_PASSWORD_LIMIT) - 1
					) {
						return respHelper(res, {
							status: 404,
							msg: constant.REACHED_WRONG_PASSWORD_LIMIT,
						});
					}

					return respHelper(res, {
						status: 404,
						msg: constant.INVALID_CREDENTIALS,
					});
				}
			}

			const loggedInUser = await validateUser(req, existUser);

			return respHelper(res, {
				status: 200,
				msg: constant.LOGIN_SUCCESS,
				token: loggedInUser.token,
				data: loggedInUser.userData,
			});
		} catch (error) {
			console.log(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async sso(req, res) {
		try {
			const existUser = await db.employeeMaster.findOne({
				where: { empCode: req.user[0], isActive: 1 },
				include: [
					{
						model: db.roleMaster,
					},
					{
						model: db.designationMaster,
						attributes: ["designationId", "name"],
					},
				],
			});

			if (!existUser) {
				return respHelper(res, {
					status: 404,
					msg: constant.USER_NOT_EXIST,
				});
			}

			if (existUser.dataValues.accountRecoveryTime) {
				return respHelper(res, {
					status: 404,
					msg: constant.ACCOUNT_LOCKED,
				});
			}

			if (!existUser.dataValues.isLoginActive) {
				return respHelper(res, {
					status: 404,
					msg: constant.LOGIN_BLOCKED,
				});
			}

			const loggedInUser = await validateUser(req, existUser);

			return respHelper(res, {
				status: 200,
				msg: constant.LOGIN_SUCCESS,
				token: loggedInUser.token,
				data: loggedInUser.userData,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async testapi(req, res) {
		try {
			const regularizeData = await db.regularizationMaster.findAndCountAll({
				attributes: ["regularizeId", "regularizePunchInDate", "createdBy"],
			});
			// console.log(regularizeData.dataValues.createdBy)
			for (const element of regularizeData.rows) {
				// console.log(`${element.dataValues.regularizePunchInDate} - ${element.dataValues.createdBy}`)
				// console.log(element.dataValues.regularizePunchInDate)
				const attendanceData = await db.attendanceMaster.findOne({
					where: {
						employeeId: element.dataValues.createdBy,
						attendanceDate: element.dataValues.regularizePunchInDate,
					},
					attribute: ["attendanceAutoId"],
				});

				await db.regularizationMaster.update(
					{
						attendanceAutoId: attendanceData.dataValues.attendanceAutoId,
					},
					{
						where: {
							regularizeId: element.dataValues.regularizeId,
						},
					},
				);
			}

			return respHelper(res, {
				status: 200,
				data: regularizeData,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
			});
		}
	}
	// generate session
	async createSession(req, res) {
		try {
			let id = req.userData.id;
			const sessionId = crypto.randomBytes(32).toString("hex");
			const userAgent = req.headers["user-agent"];

			let secret = process.env.QR_SESSION_SECRET;
			let signedToken = signSessionId(sessionId, secret);
			const expiresAt = new Date(Date.now() + 50 * 1000); // 50 seconds from now
			await db.qrSessionHistory.create({
				sessionId: signedToken,
				employeeId: id,
				createdBy: id,
				expiresAt: expiresAt,
				userAgent: userAgent,
			});
			return respHelper(res, {
				status: 200,
				msg: "Session id generated successfully",
				data: { sessionId: signedToken, loggedIn: false },
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// authenticate session
	async authenticateSessionStatus(req, res) {
		try {
			const { sessionId } = req.params;
			let secret = process.env.QR_SESSION_SECRET;
			let verifySessionId = verifySignedSessionId(sessionId, secret);

			let verifySession = await db.qrSessionHistory.findOne({
				where: { sessionId: sessionId },
				attributes: [
					"qrSessionId",
					"sessionId",
					"employeeId",
					"loggedIn",
					"expiresAt",
				],
				raw: true,
			});

			if (!verifySession || !verifySessionId) {
				return respHelper(res, {
					status: 404,
					msg: "Invalid Session Id",
					data: {},
				});
			}

			if (new Date() > new Date(verifySession.expiresAt)) {
				return respHelper(res, {
					status: 403,
					msg: "QR code expired",
					data: {},
				});
			}

			return respHelper(res, {
				status: 200,
				msg: verifySession.loggedIn
					? "QR code verified"
					: "QR code is not verify",
				data: {
					sessionId: verifySession.sessionId,
					loggedIn: verifySession.loggedIn,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// check status and login by qr code
	async loginWithQRCode(req, res) {
		try {
			const { sessionId } = req.params;
			let secret = process.env.QR_SESSION_SECRET;
			let verifySessionId = verifySignedSessionId(sessionId, secret);

			let verifySession = await db.qrSessionHistory.findOne({
				where: { sessionId: sessionId, loggedIn: false },
				attributes: [
					"qrSessionId",
					"sessionId",
					"employeeId",
					"loggedIn",
					"expiresAt",
				],
				raw: true,
			});

			if (!verifySession || !verifySessionId) {
				return respHelper(res, {
					status: 404,
					msg: "Invalid Session Id",
					data: {},
				});
			}

			if (new Date() > new Date(verifySession.expiresAt)) {
				return respHelper(res, {
					status: 403,
					msg: "QR code expired",
					data: {},
				});
			}

			const existUser = await db.employeeMaster.findOne({
				where: { id: verifySession.employeeId, isActive: 1 },
				include: [
					{
						model: db.roleMaster,
						attributes: ["role_id", "name"],
					},
					{
						model: db.designationMaster,
						attributes: ["designationId", "name"],
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "companyLogo"],
					},
				],
			});

			if (!existUser) {
				return respHelper(res, {
					status: 404,
					msg: constant.USER_NOT_EXIST,
				});
			}

			if (!existUser.dataValues.isLoginActive) {
				return respHelper(res, {
					status: 404,
					msg: constant.LOGIN_BLOCKED,
				});
			}

			if (
				existUser.dataValues.wrongPasswordCount ===
				parseInt(process.env.WRONG_PASSWORD_LIMIT)
			) {
				return respHelper(res, {
					status: 404,
					msg: constant.ACCOUNT_LOCKED,
				});
			}

			const loggedInUser = await validateUser(req, existUser);

			// update status of loggedIn in qrsession table after login successfully

			await db.qrSessionHistory.update(
				{
					employeeId: existUser.id,
					loggedIn: true,
					updatedBy: existUser.id,
					updatedAt: new Date(),
					loginIP:
						req.headers["x-real-ip"] || (await helper.ip(req._remoteAddress)),
					loginDevice: req.headers.source ? req.headers.source : null,
				},
				{ where: { sessionId: sessionId } },
			);

			return respHelper(res, {
				status: 200,
				msg: constant.LOGIN_SUCCESS,
				token: loggedInUser.token,
				data: loggedInUser.userData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
}

const validateUser = async (req, existUser) => {
	delete existUser.dataValues.password;

	await db.employeeMaster.update(
		{ lastLogin: moment(), wrongPasswordCount: 0 },
		{ where: { id: existUser.dataValues.id } },
	);

	await db.loginDetails.create({
		employeeId: existUser.dataValues.id,
		loginIP: req.headers["x-real-ip"] || (await helper.ip(req._remoteAddress)),
		loginDevice: req.headers.source ? req.headers.source : null,
		firebasetoken: req.headers.firebasetoken, ///firebase token added
		createdDt: moment(),
	});

	const payload = {
		user: {
			id: existUser.id,
			name: existUser.name,
			role: existUser.role.name,
			device: req.headers.source ? req.headers.source : null,
			firebasetoken: req.headers.firebasetoken,
		},
	};

	const token = await helper.generateJwtToken(payload);

	return {
		token,
		userData: {
			emp: existUser,
			tokens: {
				accessToken: token,
				refreshToken: token,
			},
		},
	};
};
function signSessionId(sessionId, secret) {
	const signature = crypto
		.createHmac("sha256", secret)
		.update(sessionId)
		.digest("hex");
	return `${sessionId}.${signature}`;
}

function verifySignedSessionId(token, secret) {
	const [sessionId, signature] = token.split(".");
	const expectedSig = crypto
		.createHmac("sha256", secret)
		.update(sessionId)
		.digest("hex");
	return signature === expectedSig ? sessionId : null;
}

export default new AuthController();
