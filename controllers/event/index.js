const response = require("../../components/response")
const { db, event } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { getCurriculumActive } = require("../query/curriculum")
const { INSERT_UPDATE_EVENT } = require("../../middleware/schema-validator")
const Validator = require("fastest-validator");
const v = new Validator();

exports.insertUpdateEvent = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_UPDATE_EVENT);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  const { id, name, description, needVote, eventDate, imageUrl } = req.body
  try {
    if (!id) {
      const objResponse = {
        id: nanoid(36),
        name,
        description,
        eventVoteType: needVote,
        eventDate: new Date(eventDate),
        imageUrl,
        createdDate: new Date(),
        updatedDate: new Date()
      }
      await event.create({
        ...objResponse
      })
      return response.res200(res, "000", `Sukses memasukkan data event ${name}`, objResponse)
    }

    await event.update(
      {
        name,
        description,
        eventVoteType: needVote,
        eventDate: new Date(eventDate),
        ...(imageUrl && { imageUrl }),
        // status: checkCurriculumActive ? "ACTIVE" : "INACTIVE",
        updatedDate: new Date()
      },
      {
        where: {
          id
        }
      }
    )
    return response.res200(res, "000", `Sukses mengubah data event ${name}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}


exports.getAllEvents = async (req, res, next) => {
  const getAllEventData = await event.findAll({
    raw: true,
    attributes: ["id", "name", "description", "eventVoteType", "eventDate", "imageUrl"],
    order:[["createdDate", "DESC"]]
  })
  return response.res200(res, "000", "success get all event data.", getAllEventData || []);
}
