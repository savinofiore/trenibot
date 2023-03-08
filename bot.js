const TelegramBot = require('node-telegram-bot-api');
const request = require('request-promise');

// Inserisci il token del tuo bot Telegram qui
const token = '6031162818:AAE_FAcDxhy6-487lZK9_RcCX9FORInA7JI';

// Crea un'istanza del bot
const bot = new TelegramBot(token, {polling: true});

// URL dell'API di Trenitalia per ottenere i prezzi dei treni
//const apiUrl = 'https://www.lefrecce.it/msite/api/solutions?origin=BARLETTA&destination=FIRENZE&arflag=A&adate=2023-03-15&at=4&adultno=1&childno=0&direction=A&frecce=false&onlyRegional=false';
//const apiUrl = `https://www.lefrecce.it/msite/api/solutions?origin=${origin}&destination=${destination}&arflag=A&adate=2023-03-15&at=4&adultno=1&childno=0&direction=A&frecce=false&onlyRegional=false`;

// Intervallo di tempo tra le richieste API in millisecondi
const interval = 60000;

// Prezzo massimo desiderato
const maxPrice = 50;

// Funzione per ottenere i prezzi dei treni
const getTrainPrices = async (origin, destination) => {
    try {
      const apiUrl = `https://www.lefrecce.it/msite/api/solutions?origin=${origin}&destination=${destination}&arflag=A&adate=2023-03-15&at=4&adultno=1&childno=0&direction=A&frecce=false&onlyRegional=false`;
      const response = await request(apiUrl, { json: true });
      const solutions = response.Solutions || [];
      for (let i = 0; i < solutions.length; i++) {
        const price = solutions[i].Fares.Total || 0;
        if (price <= maxPrice) {
          return price;
        }
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  
// Funzione per inviare un messaggio al bot Telegram
const sendMessage = async (chatId, message) => {
    try {
      await bot.sendMessage(chatId, message);
    } catch (error) {
      console.error(error);
    }
  }

// Funzione principale per eseguire il bot
const main = async () => {
    try {
      bot.onText(/\/start/, async (msg) => {
        await sendMessage(msg.chat.id, "Benvenuto nel bot dei prezzi dei treni! Per iniziare, inviami il tuo luogo di partenza e di arrivo nel formato: /start Roma Milano");
      });
  
      bot.onText(/\/trova (.+) (.+)/, async (msg, match) => {
        const origin = match[1];
        const destination = match[2];
        const price = await getTrainPrices(origin, destination);
        if (price) {
          const message = `Prezzo dei treni disponibili da ${origin} a ${destination}: ${price} euro`;
          await sendMessage(msg.chat.id, message);
        } else {
          await sendMessage(msg.chat.id, `Non ci sono treni disponibili da ${origin} a ${destination} con un prezzo inferiore o uguale a ${maxPrice} euro.`);
        }
      });
    } catch (error) {
      console.error(error);
    }
    //setTimeout(main, interval);
  }
  

// Avvia il bot
main();
