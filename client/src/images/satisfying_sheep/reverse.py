from PIL import Image
import os

# Get all PNG files in current directory
png_files = [f for f in os.listdir('.') if f.endswith('.png')]

for png_file in png_files:
    # Open the image
    img = Image.open(png_file)
    
    # Mirror the image horizontally
    mirrored_img = img.transpose(Image.FLIP_LEFT_RIGHT)
    
    # Create new filename with _Left suffix
    filename_without_ext = os.path.splitext(png_file)[0]
    new_filename = f"{filename_without_ext}_Left.png"
    
    # Save the mirrored image
    mirrored_img.save(new_filename)
    print(f"Created mirrored image: {new_filename}")

print("All images have been mirrored successfully!")