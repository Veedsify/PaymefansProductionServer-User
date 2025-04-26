import * as tus from "tus-js-client";

async function UploadWithTus(
  file: File,
  uploadUrl: string,
  id: string,
  setProgress: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
  setUploadError: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >
): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: uploadUrl,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: 8388608,
      uploadSize: file.size,
      metadata: {
        name: file.name,
        filetype: file.type,
      },
      onError: function (error) {
        console.error("Upload failed:", error);
        setUploadError((prev) => ({
          ...prev,
          [id]: true,
        }));
        reject(error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = parseFloat(
          ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        );
        setProgress((prev) => ({
          ...prev,
          [id]: Math.floor(percentage),
        }));
        console.log(file.name, bytesUploaded, bytesTotal, percentage + "%");
      },
      onSuccess: function () {
        setProgress((prev) => ({
          ...prev,
          [id]: 100,
        }));
      },
      onAfterResponse: function (_, res) {
        const mediaIdHeader = res.getHeader("Stream-Media-Id");
        if (mediaIdHeader) {
          resolve(mediaIdHeader);
        }
      },
    });
    upload.start();
  });
}
export default UploadWithTus;
