const response = require("../../components/response")
const { db, announcement } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const { INSERT_UPDATE_ANNOUNCEMENT } = require("../../middleware/schema-validator")
const Validator = require("fastest-validator");
const v = new Validator();

exports.insertUpdateAnnouncement = async (req, res, next) => {
  const payloadCheck = await v.compile(INSERT_UPDATE_ANNOUNCEMENT);
  const resPayloadCheck = await payloadCheck(req.body);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  const { id, title, body } = req.body
  try {
    if (!id) {
      const objResponse = {
        id: nanoid(36),
        title,
        body,
        createdDate: new Date(),
        updatedDate: new Date()
      }
      await announcement.create({
        ...objResponse
      })
      return response.res200(res, "000", `Sukses memasukkan data pengumuman ${title}`, objResponse)
    }

    await announcement.update(
      {
        title,
        body,
        updatedDate: new Date()
      },
      {
        where: {
          id
        }
      }
    )
    return response.res200(res, "000", `Sukses mengubah data pengumuman ${title}`)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal. Mohon cek kembali data yang dibuat.")
  }
}


exports.getAllAnnouncements = async (req, res, next) => {
  const getAllAnnouncementData = await announcement.findAll({
    raw: true,
    order:[["createdDate", "DESC"]]
  })
  return response.res200(res, "000", "success get all announcement data.", getAllAnnouncementData || []);
}

exports.deleteEvent = async (req, res, next) => {
  const { id } = req.body
  if (!id) return response.res400(res, "id is required.")

  try {
    await announcement.destroy({
      where: { id }
    })

    return response.res200(res, "000", "Sukses menghapus announcement.")
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Interaksi gagal.")
  }
}
