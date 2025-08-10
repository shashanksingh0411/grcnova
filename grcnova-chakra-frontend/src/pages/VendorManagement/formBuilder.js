export default {
  getStandardQuestions() {
    return [
      {
        id: "dataEncryption",
        label: "Does the vendor encrypt data at rest?",
        type: "boolean",
        required: true,
      },
      // Add more questions as needed
    ];
  },
};