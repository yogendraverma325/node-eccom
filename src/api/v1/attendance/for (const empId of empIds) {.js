for (const empId of empIds) {
	for(const date of dates){
        const curDate = moment(date);
		let lastDayDate = curDate.format("YYYY-MM-DD");
		let lastDayDateAnotherFormat = curDate.format("DD-MM-YYYY");
		let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
		let dayCode = parseInt(curDate.format("d")) + 1;

		let dayOfMonth = parsedDate.date();
		let occurrence = Math.ceil(dayOfMonth / 7);

		// Output the result
		let occurrenceDayCondition = {};
		switch (occurrence) {
			case 1:
				occurrenceDayCondition = {
					dayId: dayCode,
					isfirstDayOff: 1,
				};
				break;
			case 2:
				occurrenceDayCondition = {
					dayId: dayCode,
					isSecondDayOff: 1,
				};
				break;
			case 3:
				occurrenceDayCondition = {
					dayId: dayCode,
					isThirdyDayOff: 1,
				};
				break;
			case 4:
				occurrenceDayCondition = {
					dayId: dayCode,
					isFourthDayOff: 1,
				};
				break;
			case 5:
				occurrenceDayCondition = {
					dayId: dayCode,
					isFivethDayOff: 1,
				};
				break;
			default:
		}
		const singleEmp = await db.employeeMaster.findOne({
			include: [
				{
					model: db.shiftMaster,
					required: false,
					attributes: [
						"shiftId",
						"shiftName",
						"shiftStartTime",
						"shiftEndTime",
						"isOverNight",
					],
					where: {
						isActive: 1,
					},
				},
				{
					model: db.AttendanceRoster,
					required: false,
					where: {
						isActive: 1,
						attendanceDate: lastDayDate,
					},
					include: [
						{
							model: db.shiftMaster,
							required: false,
							attributes: [
								"shiftId",
								"shiftName",
								"shiftStartTime",
								"shiftEndTime",
								"isOverNight",
							],
						},
						{
							model: db.weekOffMaster,
							where: {
								isActive: 1,
							},
							include: [
								{
									model: db.weekOffDayMappingMaster,
									attributes: ["weekOffId"],
									required: false,
									where: occurrenceDayCondition,
								},
							],
						},
					],
				},
				{
					model: db.attendancePolicymaster,
					required: false,
					where: {
						isActive: 1,
					},
				},
				{
					model: db.attendanceMaster,
					required: false,
					where: {
						attendanceDate: lastDayDate,
						needAttendanceCron: [0, 1],
					},
					include: {
						model: db.weekOffMaster,
						required: false,
						where: {
							isActive: 1,
						},
						include: [
							{
								model: db.weekOffDayMappingMaster,
								required: false,
								where: occurrenceDayCondition,
							},
						],
					},
				},
				{
					model: db.employeeLeaveTransactions,
					required: false,
					where: {
						appliedFor: lastDayDate,
						status: "approved",
					},
				},
				{
					model: db.weekOffMaster,
					required: true,
					where: {
						isActive: 1,
					},
					include: [
						{
							model: db.weekOffDayMappingMaster,
							required: false,
							where: occurrenceDayCondition,
						},
					],
				},
				{
					model: db.holidayCompanyLocationConfiguration,
					required: false,
					include: {
						model: db.holidayMaster,
						required: true,
						as: "holidayDetails",
						attributes: ["holidayName", "holidayDate"],
						where: {
							isActive: 1,
							holidayDate: lastDayDate,
						},
					},
				},
			],
			where: {
				isActive: 1,
				id: empId,
			},
		});

		let presentStatus = null;

	
	    let overnight=singleEmp.attendanceroster
						? singleEmp.attendanceroster.shiftsmaster.isOverNight
						: singleEmp.shiftsmaster.isOverNight;
						const combinedDateTimeNextDayClone = curDate
						.clone()
						.add(1, "days");
		let endDate=overnight?combinedDateTimeNextDayClone.format("YYYY-MM-DD"):curDate.format("YYYY-MM-DD");
		


		if (
			(singleEmp?.weekOffMaster &&
				singleEmp?.weekOffMaster?.weekOffDayMappingMasters.length > 0) ||
			(singleEmp.attendanceroster &&
				singleEmp.attendanceroster.weekOffMaster &&
				singleEmp.attendanceroster.weekOffMaster.weekOffDayMappingMasters
					.length > 0)
		) {
			presentStatus = "weeklyOff";
		} else if (
			singleEmp.holidaycompanylocationconfigurations &&
			singleEmp.holidaycompanylocationconfigurations.length > 0
		) {
			presentStatus = "holiday";
		} else if (singleEmp.employeeleavetransaction) {
			presentStatus = "leave";
		} else {
			presentStatus = "absent";
		}
		await helper.revokeAppliedLeave(lastDayDate, empId);

		if (singleEmp.attendancemaster) {
			//console.log("attendancce ka data hai");
			if (singleEmp.attendancemaster.needAttendanceCron == 1) {
				if (
					singleEmp.attendancemaster.attendancePunchInTime &&
					singleEmp.attendancemaster.attendancePunchOutTime
				) {
					presentStatus = "present";
					let isHalfDay_late_by = null;
					let halfDayFor_late_by = null;
					let isHalfDay_total_work = null;
					let halfDayFor_total_work = null;

					if (
						singleEmp.attendancePolicymaster.isleaveDeductPolicyLateDuration ==
						1
					) {
						const time = moment.duration(
							singleEmp.attendancemaster.attendanceLateBy,
						);

						// Calculate the total minutes
						let totalMinutesLateMinutes = time.asMinutes();
						if (totalMinutesLateMinutes > 0) {
							totalMinutesLateMinutes =
								totalMinutesLateMinutes +
								singleEmp.attendancePolicymaster.graceTimeClockIn; // Adjust Grace time with late by for leave calculation
						}

						if (
							totalMinutesLateMinutes >=
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationHalfDayTime &&
							totalMinutesLateMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationFullDayTime
						) {
							isHalfDay_late_by = 1;
							halfDayFor_late_by = 1;
						} else if (
							totalMinutesLateMinutes >
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationHalfDayTime &&
							totalMinutesLateMinutes >=
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationFullDayTime
						) {
							isHalfDay_late_by = 0;
							halfDayFor_late_by = 0;
						}
					}

					if (
						singleEmp.attendancePolicymaster.isleaveDeductPolicyWorkDuration ==
						1
					) {
						const timeWorkDuration = moment.duration(
							singleEmp.attendancemaster.attendanceWorkingTime,
						);

						// Calculate the total minutes
						const totalMinutesTotalHoursMinutes = timeWorkDuration.asMinutes();

						if (
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationHalfDayTime &&
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationFullDayTime
						) {
							isHalfDay_total_work = 0;
							halfDayFor_total_work = 0;
						} else if (
							totalMinutesTotalHoursMinutes >
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationHalfDayTime &&
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationFullDayTime
						) {
							isHalfDay_total_work = 1;
							halfDayFor_total_work = 1;
						}
					}

					let markHalfDay = null;
					let markHalfDayType = null;
					if (isHalfDay_late_by == 0 || isHalfDay_total_work == 0) {
						markHalfDay = 0;
						markHalfDayType = 0;
					} else if (isHalfDay_late_by == 1 && isHalfDay_total_work == 1) {
						markHalfDay = 0;
						markHalfDayType = 0;
					} else if (isHalfDay_late_by == 1 && isHalfDay_total_work == null) {
						markHalfDay = 1;
						markHalfDayType = 1;
					} else if (isHalfDay_late_by == null && isHalfDay_total_work == 1) {
						markHalfDay = 1;
						markHalfDayType = 2;
					}

					if (
						markHalfDay != null &&
						singleEmp.weekOffMaster &&
						singleEmp.weekOffMaster.weekOffDayMappingMasters.length == 0 &&
						!singleEmp.attendanceroster &&
						singleEmp.holidaycompanylocationconfigurations &&
						singleEmp.holidaycompanylocationconfigurations.length == 0
					) {
						let EMP_DATA = await helper.getEmpProfile(singleEmp.id);
						if (EMP_DATA) {
							await helper.empMarkLeaveOfGivenDate(
								singleEmp.id,
								{
									employeeId: singleEmp.id, // Replace with actual employee ID
									attendanceShiftId: singleEmp.shiftsmaster.shiftId, // Replace with actual attendance shift ID
									attendancePolicyId:
										singleEmp.attendancePolicymaster.attendancePolicyId, // Replace with actual attendance policy ID
									leaveAutoId:
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationLeaveType, // Replace with actual leave auto ID
									appliedOn: moment(lastDayDate).format("YYYY-MM-DD"), // Replace with actual applied on date
									appliedFor: lastDayDate, // Replace with actual applied for date
									fromDate: lastDayDate,
									toDate: lastDayDate,
									isHalfDay: markHalfDay, // Replace with actual is half day value (0 or 1)
									halfDayFor: markHalfDayType, // Replace with actual half day for value
									leaveCount: markHalfDay == 1 ? 0.5 : 1,
									status: isHalfDay_total_work == null ? "approved" : "pending", // Replace with actual status
									reason: "Late By/ Work Duration", // Replace with actual reason
									message: "Late By/ Work Duration",
									pendingAt: EMP_DATA.managerData.id, // Replace with actual pending at value
									createdBy: singleEmp.id, // Replace with actual creator user ID
									createdAt: moment(), // Replace with actual creation date
									punchInTime: singleEmp.attendancemaster.attendancePunchInTime,
									punchOutTime:
										singleEmp.attendancemaster.attendancePunchOutTime,
									weekOffId: singleEmp.attendanceroster
										? singleEmp.attendanceroster.weekOffId
										: singleEmp.weekOffMaster
											? singleEmp.weekOffMaster.weekOffId
											: 0,
								},
								"id_" + curDate.format("YYYYMMDDHHmmss") + singleEmp.id,
								isHalfDay_late_by,
								isHalfDay_total_work,
								EMP_DATA,
								singleEmp,
							);
						}
					}
				} else if (
					(singleEmp.attendancemaster.attendancePunchInTime &&
						!singleEmp.attendancemaster.attendancePunchOutTime &&
						singleEmp?.weekOffMaster &&
						singleEmp?.weekOffMaster?.weekOffDayMappingMasters.length > 0) ||
					(singleEmp.attendanceroster &&
						singleEmp.attendanceroster.weekOffMaster &&
						singleEmp.attendanceroster.weekOffMaster.weekOffDayMappingMasters
							.length > 0)
				) {
					presentStatus = "weeklyOff";
				} else if (
					singleEmp.attendancemaster.attendancePunchInTime &&
					!singleEmp.attendancemaster.attendancePunchOutTime &&
					singleEmp.holidaycompanylocationconfigurations &&
					singleEmp.holidaycompanylocationconfigurations.length > 0
				) {
					presentStatus = "holiday";
				} else if (
					singleEmp.attendancemaster.attendancePunchInTime &&
					!singleEmp.attendancemaster.attendancePunchOutTime
				) {
					presentStatus = "singlePunchAbsent";
				}

				if (
					singleEmp.attendancemaster &&
					singleEmp.attendancemaster.attendanceWorkingTime
				) {
					let compofftype = "Week Day";
					let attendance_auto_id = singleEmp.attendancemaster.attendanceAutoId;
					let attendanceStartDate =
						singleEmp.attendancemaster.attandanceShiftStartDate;
					let attendanceEndDate =
						singleEmp.attendancemaster.attendanceShiftEndDate;
					let shiftStartTime = singleEmp.shiftsmaster.shiftStartTime;
					let shiftEndTime = singleEmp.shiftsmaster.shiftEndTime;

					let allowedTime = await helper.timeDifference(
						`${attendanceStartDate} ${shiftStartTime}`,
						`${attendanceEndDate} ${shiftEndTime}`,
					);
					let working_hours = singleEmp.attendancemaster.attendanceWorkingTime;

					const employeeData = {
						compofftype: compofftype,
						attendance_auto_id: attendance_auto_id,
						attendanceStartDate: attendanceStartDate,
						attendanceEndDate: attendanceEndDate,
						attendanceDate: singleEmp.attendancemaster.attendanceDate,
						shiftStartTime: shiftStartTime,
						shiftEndTime: shiftEndTime,
						allowedTime: allowedTime,
						empId: empId,
						working_hours: working_hours,
						holiday: singleEmp.holidaycompanylocationconfigurations,
						weekoff:
							singleEmp.attendanceroster &&
							singleEmp.attendanceroster.weekOffMaster &&
							singleEmp.attendanceroster.weekOffMaster.weekOffDayMappingMasters
								.length != 0
								? singleEmp.attendanceroster.weekOffMaster
										.weekOffDayMappingMasters
								: singleEmp?.weekOffMaster?.weekOffDayMappingMasters,
					};
					await helper.creditCompoff(employeeData);
				}
				await db.attendanceMaster.update(
					{
						attendanceShiftEndDate: endDate,
						attendanceShiftEndDate2: endDate,
						attendancePresentStatus: presentStatus,
						needAttendanceCron: 0,
					},
					{
						where: {
							attendanceAutoId: singleEmp.attendancemaster.attendanceAutoId,
						},
					},
				);
			}
		} else {


			await db.attendanceMaster.create({
				attendanceDate: curDate.format("YYYY-MM-DD"),
				attandanceShiftStartDate: curDate.format("YYYY-MM-DD"),
				attendanceShiftEndDate: endDate,
				attendanceShiftEndDate2: endDate,
				employeeId: singleEmp.id,
				attendancePolicyId: singleEmp.attendancePolicyId,
				attendanceShiftId: singleEmp.shiftId,
				attendancePresentStatus: presentStatus,
				needAttendanceCron: 0,
				weekOffId: singleEmp.weekOffMaster
					? singleEmp.weekOffMaster.weekOffId
					: 0,
				holidayCompanyLocationConfigurationID: singleEmp.companyLocationId,
			});
		}
		
	}
}