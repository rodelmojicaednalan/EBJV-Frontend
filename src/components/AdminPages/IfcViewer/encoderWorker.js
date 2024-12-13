// This is the Web Worker script that will handle the processing of the IFC file in the background.

onmessage = function (e) {
  // e.data contains the ArrayBuffer that was passed from the main thread.
  const arrayBuffer = e.data;

  try {
    // Here you can add the encoding or processing logic. For example:
    const encoder = new TextEncoder();
    const processedBuffer = encoder.encode(
      new TextDecoder().decode(arrayBuffer)
    );

    // Post the processed data back to the main thread.
    postMessage(processedBuffer);
  } catch (error) {
    // If there's an error, post an error message back.
    postMessage({ error: error.message });
  }
};
