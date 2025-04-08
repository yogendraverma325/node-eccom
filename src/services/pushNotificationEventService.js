import { EventEmitter } from "events";
import pushNotificationListner from "../helper/pushNotification.js";

const pushNotificationEmitter = new EventEmitter();

export default pushNotificationEmitter;

pushNotificationListner(pushNotificationEmitter);