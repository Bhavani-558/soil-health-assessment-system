import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras.preprocessing import image


# ============================================================
# 1. MODEL PATH
# ============================================================

MODEL_PATH = "models/soil_classifier.keras"


# ============================================================
# 2. CLASS NAMES
# ============================================================

CLASS_NAMES = [
    "Alluvial soil",
    "Black Soil",
    "Clay soil",
    "Red soil"
]


# ============================================================
# 3. LOAD MODEL
# ============================================================

print("Loading CNN model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("CNN model loaded successfully!")


# ============================================================
# 4. GRAD-CAM FUNCTION
# ============================================================

def generate_gradcam(
    image_path,
    output_path="gradcam_result.jpg"
):

    # --------------------------------------------------------
    # Check image
    # --------------------------------------------------------

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )


    # --------------------------------------------------------
    # Load image
    # --------------------------------------------------------

    img = image.load_img(
        image_path,
        target_size=(224, 224)
    )

    img_array = image.img_to_array(img)

    img_array = img_array.astype(
        "float32"
    ) / 255.0

    img_tensor = tf.convert_to_tensor(
        np.expand_dims(
            img_array,
            axis=0
        )
    )


    # --------------------------------------------------------
    # Last convolutional layer
    # --------------------------------------------------------

    conv_layer = model.get_layer(
        "conv2d_2"
    )


    # --------------------------------------------------------
    # Feature extractor
    # --------------------------------------------------------

    feature_extractor = tf.keras.Model(
        inputs=model.inputs,
        outputs=conv_layer.output
    )


    # --------------------------------------------------------
    # Grad-CAM
    # --------------------------------------------------------

    with tf.GradientTape() as tape:

        conv_outputs = feature_extractor(
            img_tensor,
            training=False
        )

        tape.watch(conv_outputs)

        x = conv_outputs

        # max_pooling2d_2
        x = model.get_layer(
            "max_pooling2d_2"
        )(x)

        # flatten
        x = model.get_layer(
            "flatten"
        )(x)

        # dense
        x = model.get_layer(
            "dense"
        )(x)

        # dropout
        x = model.get_layer(
            "dropout"
        )(x, training=False)

        # final layer
        predictions = model.get_layer(
            "dense_1"
        )(x)

        predicted_index = tf.argmax(
            predictions[0]
        )

        class_score = predictions[
            0,
            predicted_index
        ]


    # --------------------------------------------------------
    # Calculate gradients
    # --------------------------------------------------------

    grads = tape.gradient(
        class_score,
        conv_outputs
    )

    if grads is None:
        raise RuntimeError(
            "Gradients are None. "
            "Grad-CAM could not calculate gradients."
        )


    # --------------------------------------------------------
    # Global average pooling
    # --------------------------------------------------------

    pooled_grads = tf.reduce_mean(
        grads,
        axis=(0, 1, 2)
    )


    # --------------------------------------------------------
    # Create heatmap
    # --------------------------------------------------------

    conv_outputs = conv_outputs[0]

    heatmap = tf.reduce_sum(
        conv_outputs * pooled_grads,
        axis=-1
    )

    heatmap = tf.maximum(
        heatmap,
        0
    )

    max_heatmap = tf.reduce_max(
        heatmap
    )

    if float(max_heatmap.numpy()) > 0:

        heatmap = (
            heatmap / max_heatmap
        )

    heatmap = heatmap.numpy()


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    predicted_index = int(
        predicted_index.numpy()
    )

    predicted_label = CLASS_NAMES[
        predicted_index
    ]

    confidence = float(
        predictions[
            0,
            predicted_index
        ].numpy()
    )


    # --------------------------------------------------------
    # Resize heatmap
    # --------------------------------------------------------

    heatmap_resized = tf.image.resize(
        heatmap[..., np.newaxis],
        (224, 224)
    )

    heatmap_resized = tf.squeeze(
        heatmap_resized
    ).numpy()


    # --------------------------------------------------------
    # Create visualization
    # --------------------------------------------------------

    plt.figure(
        figsize=(8, 8)
    )

    plt.imshow(
        img_array
    )

    plt.imshow(
        heatmap_resized,
        cmap="jet",
        alpha=0.5
    )

    plt.axis("off")

    plt.title(
        f"Grad-CAM: {predicted_label} "
        f"({confidence * 100:.2f}%)"
    )

    plt.tight_layout()


    # --------------------------------------------------------
    # Save Grad-CAM image
    # --------------------------------------------------------

    plt.savefig(
        output_path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()


    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "soil_type": predicted_label,
        "confidence": round(
            confidence * 100,
            2
        ),
        "gradcam_layer": conv_layer.name,
        "gradcam_image": output_path
    }


# ============================================================
# 5. TEST GRAD-CAM DIRECTLY
# ============================================================

if __name__ == "__main__":

    test_image = (
        "dataset/test/Black Soil/"
        "Black_1.jpg"
    )

    result = generate_gradcam(
        test_image,
        "gradcam_result.jpg"
    )

    print()
    print("======================================")
    print("GRAD-CAM RESULT")
    print("======================================")

    print(
        "Predicted Soil Type:",
        result["soil_type"]
    )

    print(
        "CNN Confidence:",
        f'{result["confidence"]}%'
    )

    print(
        "Grad-CAM Layer:",
        result["gradcam_layer"]
    )

    print(
        "Grad-CAM image saved to:",
        result["gradcam_image"]
    )

    print("======================================")