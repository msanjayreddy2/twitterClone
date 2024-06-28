import User from "../Models/user.models.js";
import Notification from "../Models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId })
      .populate({ path: "from", select: "username profileImage" })
      .sort({ createdAt: -1 });
    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log("error in getNotifications controller", error.message);
    res.status(404).json({ error: error.message });
  }
};
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("error in deleteNotifications controller", error.message);
    res.status(404).json({ error: error.message });
  }
};
