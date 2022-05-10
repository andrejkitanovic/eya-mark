const axiosDefault = require("axios");

const axiosAuth = axiosDefault.create({
  baseURL: "https://api.ihmsweb.com",
  headers: {
    Accept: "application/json",
    "content-type": "application/x-www-form-urlencoded;charset=utf-8",
  },
});

const axiosMark = axiosDefault.create({
  baseURL: "https://api.ecimarksystems.com",
  headers: {
    Accept: "application/json",
    "content-type": "application/x-www-form-urlencoded;charset=utf-8",
  },
});

const stringify = (object) => {
  const params = new URLSearchParams();

  Object.entries(object).forEach(([key, value]) => {
    params.append(key, value);
  });
  return params;
};

exports.main = async (event, callback) => {
  try {
    const { firstName, lastName, primaryEmail, phone, address, city, state, zip } = event.inputFields;

    const { MS_CLIENT_ID, MS_CLIENT_SECRET } = process.env;

    const { data: clientData } = await axiosAuth.post(
      "/accesstoken",
      stringify({
        client_id: MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        grant_type: "client_credentials",
      })
    );

    const { access_token: accessToken } = clientData;

    const prospects = {
      properties: {
        companyCode: "990",
        developmentCode: "01",
      },
      entities: [
        {
          classRef: "master",
          externalId: "123456789",
          properties: {
            lastName,
            firstName,
            streetAddress1: address,
            city,
            state,
            zip,
            country: "US",
            homePhone1: phone,
          },
        },
      ],
    };

    const prospectsStringified = `prospects=${JSON.stringify(prospects)}`;

    const req = await axiosMark.post("/rest/EYA/prospects", prospectsStringified, {
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
