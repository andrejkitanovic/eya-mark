const axiosDefault = require("axios");

const axios = axiosDefault.create({
  baseURL: "https://api.ihmsweb.com",
  headers: {
    Accept: "application/json",
    "content-type": "application/x-www-form-urlencoded;charset=utf-8",
  },
});

const stringify = (object) =>
  Object.entries(object)
    .map((value) => value.join("="))
    .join("&");

exports.main = async (event, callback) => {
  try {
    const { firstName, lastName, primaryEmail, phone, address, city, state, zip } = event.inputFields;

    const { MS_CLIENT_ID, MS_CLIENT_SECRET } = process.env;

    const { data: clientData } = await axios.post(
      "/accesstoken",
      stringify({
        client_id: MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        grant_type: "client_credentials",
      })
    );

    const { access_token: accessToken } = clientData;

    const { data } = await axios.get("/rest/EYA/companies", {
      headers: {
        Authorization: accessToken,
      },
    });

    callback({
      outputFields: {
        error: false,
        // response: res,
      },
    });
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
    } else console.log(err);

    callback({
      outputFields: {
        error: true,
      },
    });
  }
};
