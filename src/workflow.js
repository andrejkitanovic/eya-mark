const axiosDefault = require("axios");

const axios = axiosDefault.create({
  baseURL: "https://api.ihmsweb.com",
  headers: {
    Accept: "application/json",
    "content-type": "application/x-www-form-urlencoded;charset=utf-8",
  },
});

// const stringifyChild = (sub, object) =>
//   Object.entries(object)
//     .map((value) => {
//       if (typeof value[1] === "object") {
//         return stringifyChild(`${sub}.${value[0]}`, value[1]);
//       }

//       return `${sub}.${value[0]}=${value[1]}`;
//     })
//     .join("&");

// const stringify = (object) =>
//   Object.entries(object)
//     .map((value) => {
//       if (typeof value[1] === "object") {
//         return stringifyChild(value[0], value[1]);
//       }
//       return value.join("=");
//     })
//     .join("&");

const stringify = (object) => {
  const params = new URLSearchParams();

  Object.entries(object).forEach(([key, value]) => {
    params.append(key, value);
  });
  return params;
};

exports.main = async (event, callback) => {
  try {
    const { firstName, lastName, primaryEmail, phone, address, city, state, zip, country } = event.inputFields;

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

    const prospects = {
      properties: {
        companyCode: "100",
        developmentCode: "1A",
      },
      entities: [
        {
          classRef: "master",
          externalId: "123456789",
          properties: {
            lastName: "Essie",
            firstName: "Vaill",
            salutation: "Mrs.",
            streetAddress1: "14225 Hancock Dr",
            streetAddress2: "E",
            city: "Anchorage",
            state: "AK",
            zip: "99515",
            country: "US",
            homePhone1: "907-345-0962",
            workPhone1: "907-345-1215",
          },
        },
      ],
    };

    const prospectsStringified = `prospects=${JSON.stringify(prospects)}`;

    const req = await axiosDefault.post("https://api.ecimarksystems.com/rest/EYA/prospects", prospectsStringified, {
      headers: {
        Authorization: accessToken,
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
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
