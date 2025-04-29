// import { EventEmitter } from 'node:events';
import { EventEmitter } from "events";
import getAllListeners from "../helper/mailHelper.js";
import getAllSMSListeners from "../helper/smsHelper.js";

const eventEmitter = new EventEmitter();

export default eventEmitter;

getAllListeners(eventEmitter);
getAllSMSListeners(eventEmitter);

//---------------------------------------------------------------------------
//                         For Event Emitter
// ---------------------------------------------------------------------------
// import eventEmitter from "../../../services/eventService.js";
// eventEmitter.emit('sendRegistrationMail', JSON.stringify(userObject));
// ----------------------------------------------------------------------------
