<<<<<<< HEAD
export default (sequelize, Sequelize) => {
	const employeeAddress = sequelize.define("employeeaddress", {
		addressId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		employeeId: {
			type: Sequelize.INTEGER,
		},
		addressType: {
			type: Sequelize.INTEGER,
		},
		currentHouse: {
			type: Sequelize.STRING,
		},
		currentStreet: {
			type: Sequelize.STRING,
		},
		currentStateId: {
			type: Sequelize.INTEGER,
		},
		currentCityId: {
			type: Sequelize.INTEGER,
		},
		currentCountryId: {
			type: Sequelize.INTEGER,
		},
		currentPincodeId: {
			type: Sequelize.STRING,
		},
		currentLandmark: {
			type: Sequelize.STRING,
		},
		permanentCityId: {
			type: Sequelize.INTEGER,
		},
		permanentStateId: {
			type: Sequelize.INTEGER,
		},
		permanentCountryId: {
			type: Sequelize.INTEGER,
		},
		permanentPincodeId: {
			type: Sequelize.STRING,
		},
		permanentStreet: {
			type: Sequelize.STRING,
		},
		permanentHouse: {
			type: Sequelize.STRING,
		},
		permanentLandmark: {
			type: Sequelize.STRING,
		},
		emergencyStreet: {
			type: Sequelize.STRING,
		},
		emergencyHouse: {
			type: Sequelize.STRING,
		},
		emergencyCityId: {
			type: Sequelize.INTEGER,
		},
		emergencyStateId: {
			type: Sequelize.INTEGER,
		},
		emergencyCountryId: {
			type: Sequelize.INTEGER,
		},
		emergencyPincodeId: {
			type: Sequelize.STRING,
		},
		emergencyLandmark: {
			type: Sequelize.STRING,
		},
		// laptopSystem: {
		//     type: Sequelize.STRING
		// },
		// backgroundVerification: {
		//     type: Sequelize.BOOLEAN
		// },
		// gender: {
		//     type: Sequelize.STRING
		// },
		// dateOfBirth: {
		//     type: Sequelize.DATE
		// },
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		createdByRole: {
			type: Sequelize.STRING,
		},
		updatedByRole: {
			type: Sequelize.STRING,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
		},
		// ritak address approval start
		sectionType: {
			type: Sequelize.STRING,
			defaultValue: "Address Section",
		},
		status: {
			type: Sequelize.STRING,
			defaultValue: "approved",
		},
		newCurrentHouse: {
			type: Sequelize.STRING,
		},
		newCurrentStreet: {
			type: Sequelize.STRING,
		},
		newCurrentStateId: {
			type: Sequelize.INTEGER,
		},
		newCurrentCityId: {
			type: Sequelize.INTEGER,
		},
		newCurrentCountryId: {
			type: Sequelize.INTEGER,
		},
		newCurrentPincodeId: {
			type: Sequelize.INTEGER,
		},
		newCurrentLandmark: {
			type: Sequelize.STRING,
		},
		newPermanentCityId: {
			type: Sequelize.INTEGER,
		},
		newPermanentStateId: {
			type: Sequelize.INTEGER,
		},
		newPermanentCountryId: {
			type: Sequelize.INTEGER,
		},
		newPermanentPincodeId: {
			type: Sequelize.INTEGER,
		},
		newPermanentStreet: {
			type: Sequelize.STRING,
		},
		newPermanentHouse: {
			type: Sequelize.STRING,
		},
		newPermanentLandmark: {
			type: Sequelize.STRING,
		},
		newEmergencyStreet: {
			type: Sequelize.STRING,
		},
		newEmergencyHouse: {
			type: Sequelize.STRING,
		},
		newEmergencyCityId: {
			type: Sequelize.INTEGER,
		},
		newEmergencyStateId: {
			type: Sequelize.INTEGER,
		},
		newEmergencyCountryId: {
			type: Sequelize.INTEGER,
		},
		newEmergencyPincodeId: {
			type: Sequelize.INTEGER,
		},
		newEmergencyLandmark: {
			type: Sequelize.STRING,
		},
		pendingAt: {
			type: Sequelize.INTEGER,
		},
		comment: {
			type: Sequelize.TEXT,
		},
		requestTriggered: {
			type: Sequelize.DATE,
		},
		// ritak address approval end
	});
	return employeeAddress;
};
=======
export default (sequelize, Sequelize) => {
	const employeeAddress = sequelize.define("employeeaddress", {
		addressId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		employeeId: {
			type: Sequelize.INTEGER,
		},
		addressType: {
			type: Sequelize.INTEGER,
		},
		currentHouse: {
			type: Sequelize.STRING,
		},
		currentStreet: {
			type: Sequelize.STRING,
		},
		currentStateId: {
			type: Sequelize.INTEGER,
		},
		currentCityId: {
			type: Sequelize.INTEGER,
		},
		currentCountryId: {
			type: Sequelize.INTEGER,
		},
		currentPincodeId: {
			type: Sequelize.STRING,
		},
		currentLandmark: {
			type: Sequelize.STRING,
		},
		permanentCityId: {
			type: Sequelize.INTEGER,
		},
		permanentStateId: {
			type: Sequelize.INTEGER,
		},
		permanentCountryId: {
			type: Sequelize.INTEGER,
		},
		permanentPincodeId: {
			type: Sequelize.STRING,
		},
		permanentStreet: {
			type: Sequelize.STRING,
		},
		permanentHouse: {
			type: Sequelize.STRING,
		},
		permanentLandmark: {
			type: Sequelize.STRING,
		},
		emergencyStreet: {
			type: Sequelize.STRING,
		},
		emergencyHouse: {
			type: Sequelize.STRING,
		},
		emergencyCityId: {
			type: Sequelize.INTEGER,
		},
		emergencyStateId: {
			type: Sequelize.INTEGER,
		},
		emergencyCountryId: {
			type: Sequelize.INTEGER,
		},
		emergencyPincodeId: {
			type: Sequelize.STRING,
		},
		emergencyLandmark: {
			type: Sequelize.STRING,
		},
		// laptopSystem: {
		//     type: Sequelize.STRING
		// },
		// backgroundVerification: {
		//     type: Sequelize.BOOLEAN
		// },
		// gender: {
		//     type: Sequelize.STRING
		// },
		// dateOfBirth: {
		//     type: Sequelize.DATE
		// },
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
		},
	});
	return employeeAddress;
};
>>>>>>> main_dev_fnf
