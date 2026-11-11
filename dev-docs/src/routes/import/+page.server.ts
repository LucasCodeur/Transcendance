export const actions = {
  upload: async ({ request }) => {
    const data = await request.formData();
    const file = data.get("file");

    console.log("UPLOAD FUNCTION BEFORE FILE");
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Save the buffer to disk or cloud storage
      console.log("FILE: ", await file.text());
    }

    return { success: true };
  },
};
