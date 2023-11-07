const { default: axios } = require("axios");

module.exports = class Handler {
  constructor({ rekognitionSvc, translatorSvc }) {
    this.rekognitionSvc = rekognitionSvc;
    this.translatorSvc = translatorSvc;
  }

  async getImageBuffer(imageUrl) {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "base64");

    return buffer;
  }

  async detectImageLabels(buffer) {
    const result = await this.rekognitionSvc
      .detectLabels({
        Image: {
          Bytes: buffer,
        },
      })
      .promise();

    const workingItems = result.Labels.filter(
      ({ Confidence }) => Confidence > 80
    );

    const names = workingItems.map(({ Name }) => Name).join(" and ");

    return {
      names,
      workingItems,
    };
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: "en",
      TargetLanguageCode: "pt",
      Text: text,
    };

    const { TranslatedText } = await this.translatorSvc
      .translateText(params)
      .promise();

    return TranslatedText.split(" e ");
  }

  formatTextResults(texts, workingItems) {
    const finalText = [];
    for (const indexText in texts) {
      const nameInPortuguese = texts[indexText];
      const confidence = workingItems[indexText].Confidence;

      finalText.push(
        `${confidence.toFixed(2)}% de ser to tipo ${nameInPortuguese}`
      );
    }

    return finalText.join("\n");
  }

  async main(event) {
    try {
      console.log("EVENNNT:", event);
      const { imageUrl } = event.queryStringParameters;

      if (!imageUrl) {
        return {
          statusCode: 400,
          body: "an image url is required!",
        };
      }

      console.log("Downloading image...");
      const buffer = await this.getImageBuffer(imageUrl);

      console.log("Detecting labels...");
      const { names, workingItems } = await this.detectImageLabels(buffer);

      console.log("Translating to Portuguese...");
      const texts = await this.translateText(names);
      const finalTexts = this.formatTextResults(texts, workingItems);
      console.log("Finishing...");
      return {
        statusCode: 200,
        body: "A image tem\n".concat(finalTexts),
      };
    } catch (error) {
      console.log("deu ruim: ", error.stack);
      return {
        statusCode: 500,
        body: "Internal Server Error!",
      };
    }
  }
};
