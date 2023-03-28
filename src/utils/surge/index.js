const { GoogleSpreadsheet } = require("google-spreadsheet");

function getDateRange(hours) {
  const currentDate = new Date();
  const startDay = new Date(currentDate);

  let prependText = "";
  let startHour = 0;

  if (hours === 24) {
    prependText = "today";
  } else if (hours === 48) {
    startDay.setDate(currentDate.getDate() + 1);
    prependText = "tomorrow";
  } else if (hours === 168) {
    startDay.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    prependText = "this week";
  } else if (hours === 336) {
    startDay.setDate(currentDate.getDate() + 7 - currentDate.getDay() + 1);
    prependText = "next week";
  }

  if (hours === 168 || hours === 366) {
    startHour = startDay.getHours() * 60 * 60 * 1000;
  }

  const startDate = new Date(startDay.getTime() + startHour);
  const endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);

  let startDateString = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const endDateString = endDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  if (hours < 168) return `${prependText} [${startDateString}]`;
  startDateString = startDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  return `${prependText} [${startDateString} - ${endDateString}]`;
}

function getHourIndexes(hourArray, hours) {
  console.log(hourArray);

  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();
  const currentHour = now.getHours() - timezoneOffset / 60; // adjust for timezone
  const nextHour = currentHour + 1;

  // const now = new Date();
  // const currentHour = now.getHours();
  // const nextHour = currentHour + 1;

  const hourIndexes = [];
  for (let i = nextHour; i < nextHour + hours; i++) {
    hourIndexes.push(
      hourArray.findIndex((hour) => hour.startsWith(`${i % 12 || 12} `))
    );
  }
  return hourIndexes;
}

export async function getSurgeData(zone, time) {
  const duration = Number(time);
  const sheetIndex = duration === 336 ? 1 : 0;
  try {
    const private_key = process.env.GOOGLE_PRIVATE_KEY;
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_SURGE_DATA_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: private_key.replace(/\\n/gm, "\n"),
    });
    await doc.getInfo();
    const sheet = doc.sheetsByIndex[sheetIndex];
    const rows = await sheet.getRows();
    const header = rows[0]._sheet.headerValues;
    let message =
      "Surge fee in " + zone + " next " + duration + " hour(s) : \n\n";

    if (duration === 1 || duration === 2) {
      const hours = getHourIndexes(header, duration);
      console.log("Hours found", hours);
      let feeFound = false;
      for (let i = 0; i < rows.length; i += 4) {
        if (rows[i]._rawData[0] === zone) {
          console.log("Zone found", zone);
          let feeIndex = i;
          hours.forEach((hour) => {
            if (rows[i]._rawData[hour]) {
              feeFound = true;
              message += `👉 ${header[hour]}  receive  +${rows[feeIndex]._rawData[hour]}  extra per order \n`;
            }
          });
        }
        if (!feeFound) {
          return (
            "No surge fee is availble in " +
            zone +
            " next " +
            duration +
            " hour(s) : \n\n"
          );
        }
      }
      //👉 3 am - 7 am  receive  +$1.00  extra per order
      return message;
    }

    const currentDate = new Date();
    const currentWeekday = currentDate.toLocaleString("en-US", {
      weekday: "short",
    });

    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    message = "Surge fee in " + zone + " " + getDateRange(duration) + " : \n\n";

    const today = new Date();
    const dayOfWeek = today.getDay() + duration / 24 - 1;

    for (let i = 0; i < rows.length; i += 4) {
      if (rows[i]._rawData[0] === zone) {
        //return everything
        let feeIndex = i;
        if (duration > 48) {
          for (feeIndex = i; feeIndex < i + 4; feeIndex++) {
            message += `📅 ${rows[feeIndex]._rawData[1]}\n`;
            console.log("Week", feeIndex, rows[feeIndex]._rawData[1]);
            for (let f = 2; f < rows[feeIndex]._rawData.length; f++) {
              if (rows[i]._rawData[f]) {
                message += `👉 ${header[f]}  receive  +${rows[feeIndex]._rawData[f]}  extra per order \n`;
              }
            }
          }
          return message;
        }
        // weekday price
        if (!(dayOfWeek >= 1 && dayOfWeek <= 4)) {
          const increment = dayOfWeek === 0 ? 3 : dayOfWeek - 4;
          feeIndex += increment;
        }
        for (let f = 2; f < rows[feeIndex]._rawData.length; f++) {
          if (rows[i]._rawData[f]) {
            message += `👉 ${header[f]}  receive  +${rows[feeIndex]._rawData[f]}  extra per order \n`;
          }
        }

        return message;
      }
    }
  } catch (e) {
    console.log("Error occured", e.message);
  }
  // console.log(`Surge data`, zone, day, "current day", currentTime.getDay());
}
