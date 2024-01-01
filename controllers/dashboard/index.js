const response = require("../../components/response")
const { db, event, announcement } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { getCurriculumActive } = require("../query/curriculum")


exports.getDashboardStudentData = async (req, res, next) => {
  try {
    const getAllEventData = await event.findAll({
      raw: true,
      attributes: ["id", "name", "description", "eventVoteType", "eventDate", "imageUrl"],
      order: [["createdDate", "DESC"]],
      where: {
        eventVoteType: "NO_VOTE"
      },
      limit: 5
    })
    const getAllEventVoteData = await event.findAll({
      raw: true,
      attributes: ["id", "name", "description", "eventVoteType", "eventDate", "imageUrl"],
      order: [["createdDate", "DESC"]],
      where: {
        eventVoteType: "VOTE"
      },
      limit: 5
    })
    const getAllAnnouncementData = await announcement.findAll({
      raw: true,
      attributes: ["id", "title", "body"],
      order: [["createdDate", "DESC"]],
      limit: 5
    })
  
    return response.res200(res, "000", "success get all curriculum data.", {
      eventNormal: [...getAllEventData],
      eventVote: [...getAllEventVoteData],
      announcement: [...getAllAnnouncementData]
    });
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Gagal mendapatkan data.")
  }
}
