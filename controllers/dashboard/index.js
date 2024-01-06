const response = require("../../components/response")
const { db, event, announcement } = require("../../components/database");
const moment = require("moment");
const { isString } = require("../../middleware/validator");
const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const v = new Validator();
const { GET_LIST_ANNOUNCEMENT_TABLE } = require("../../middleware/schema-validator")
const { getListAnnouncementTable, totalCountAnnouncementListTable } = require("../query/announcement")

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

exports.getDashboardEventDetai = async (req, res, next) => {
  const { eventId } = req.query
  if (!eventId) return response.res400(res, "eventId is required.")

  const getEventDataDetail = await event.findOne({
    raw: true,
    attributes: ["id", "name", "description", "eventVoteType", "eventDate", "imageUrl"],
    where: {
      id: eventId
    },
  })
  if (!getEventDataDetail) return response.res200(res, "001", "event tidak ditemukan")

  return response.res200(res, "000", "Sukses mendapatkan data event detail", getEventDataDetail)
}

exports.getListAnnouncement = async (req, res, next) => {
  const payload = {
    page: Number(req.query.page) || undefined,
    pageSize: Number(req.query.pageSize) || undefined,
    searchName: req.query.searchName || '',
  }
  const payloadCheck = await v.compile(GET_LIST_ANNOUNCEMENT_TABLE);
  const resPayloadCheck = await payloadCheck(payload);

  if (resPayloadCheck !== true) {
    return response.res400(res, "Mohon cek kembali kelengkapan data yang telah dikirim.")
  }

  const { page, pageSize, searchName } = payload

  try {
    let dataAnnouncement = null;
    let totalCount = null;

    dataAnnouncement = await getListAnnouncementTable({ page, pageSize, searchName });
    totalCount = await totalCountAnnouncementListTable({ searchName });
    
    const totalPages = Math.ceil(totalCount / pageSize);
    const nextPage = dataAnnouncement.length > pageSize ? page + 1 : null
    // console.log({dataAnnouncement})
    if (dataAnnouncement.length > pageSize) dataAnnouncement.pop();

    const responseData = {
      announcementData: [...dataAnnouncement],
      totalData: totalCount,
      totalPages,
      nextPage
    }
    // console.log({totalCount, totalPages})
    return response.res200(res, "000", "Sukses mendapatkan data announcement.", responseData)
  } catch (error) {
    console.error(error)
    return response.res200(res, "001", "Data gagal didapatkan. Mohon cek kembali request yang dibuat.")
  }
}

exports.detailAnnouncement = async (req, res, next) => {
  const { announcementId } = req.query
  if (!announcementId) return response.res400(res, "announcementId is required.")

  const getDetailAnnouncement = await announcement.findOne({
    raw: true,
    where: {
      id: announcementId
    }
  })
  if (!getDetailAnnouncement) return response.res200(res, "001", "announcement tidak tersedia.")
  return response.res200(res, "000", "Sukses mendapatkan data announcement.", getDetailAnnouncement)
}