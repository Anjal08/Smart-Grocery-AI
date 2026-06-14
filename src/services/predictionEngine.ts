import * as tf from "@tensorflow/tfjs";

export interface PredictionResult {
  nextInterval: number;
  loss: number;
}

/**
 * Normalizes an array of numbers using Min-Max scaling.
 * Avoids division by zero if all values are identical.
 */
function normalizeData(data: number[]) {
  const min = Math.min(...data);
  const max = Math.max(...data);

  if (max === min) {
    // If all intervals are the same, return an array of 0.5s or original if min is 0
    return {
      normalized: data.map(() => 0.5),
      min,
      max: min + 1, // Artificial range to avoid zero division on denormalize
    };
  }

  const normalized = data.map((val) => (val - min) / (max - min));
  return { normalized, min, max };
}

/**
 * Denormalizes a scaled value back to the original interval scale.
 */
function denormalizeData(val: number, min: number, max: number) {
  return val * (max - min) + min;
}

/**
 * Creates sliding window sequences from a 1D array.
 * Default window size is 3 (i.e. use last 3 intervals to predict the 4th).
 */
function createSlidingWindows(data: number[], windowSize: number = 3) {
  const X: number[][] = [];
  const y: number[] = [];

  for (let i = 0; i <= data.length - windowSize - 1; i++) {
    X.push(data.slice(i, i + windowSize));
    y.push(data[i + windowSize]);
  }

  return { X, y };
}

/**
 * Trains an LSTM model on the provided historical purchase intervals
 * and predicts the next interval.
 */
export async function trainAndPredictLSTM(
  intervals: number[],
  windowSize: number = 3
): Promise<PredictionResult | null> {
  // Wait, if fallback is required for < 5, ensure we have at least windowSize + 1
  if (intervals.length < windowSize + 2) {
    return null;
  }

  // 1. Normalize the data
  const { normalized, min, max } = normalizeData(intervals);

  // 2. Create sequences
  const { X, y } = createSlidingWindows(normalized, windowSize);

  // 3. Convert to TF Tensors
  // X shape: [num_samples, time_steps, features] -> [num_samples, windowSize, 1]
  const xs = tf.tensor3d(X.map(row => row.map((v: number) => [v])) as number[][][], [X.length, windowSize, 1]);
  const ys = tf.tensor2d(y, [y.length, 1]);

  // 4. Build Model
  const model = tf.sequential();
  
  model.add(
    tf.layers.lstm({
      units: 10,
      inputShape: [windowSize, 1],
      returnSequences: false,
    })
  );
  
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  // 5. Train Model
  let finalLoss = 0;
  await model.fit(xs, ys, {
    epochs: 30,
    batchSize: 4,
    shuffle: false,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (logs) {
          finalLoss = logs.loss;
        }
      },
    },
  });

  console.log(`[LSTM] Training completed. Final Loss (MSE): ${finalLoss}`);

  // 6. Predict the next interval
  // Input the most recent `windowSize` intervals
  const recentWindow = normalized.slice(-windowSize);
  const inputTensor = tf.tensor3d([recentWindow.map((v: number) => [v])] as number[][][], [1, windowSize, 1]);

  const predictionTensor = model.predict(inputTensor) as tf.Tensor;
  const predictionScaled = (await predictionTensor.data())[0];

  // Cleanup tensors to prevent memory leaks
  xs.dispose();
  ys.dispose();
  inputTensor.dispose();
  predictionTensor.dispose();
  model.dispose();

  // 7. Denormalize
  const nextInterval = denormalizeData(predictionScaled, min, max);

  // Ensure predicted interval is at least 1 day
  return {
    nextInterval: Math.max(1, Math.round(nextInterval)),
    loss: finalLoss,
  };
}
