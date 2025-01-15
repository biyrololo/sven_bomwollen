from PIL import Image
import os

# Get list of PNG files in current directory
png_files = sorted([f for f in os.listdir('.') if f.startswith('PNG_') and f.endswith('.png')])
# Open all images
images = [Image.open(png) for png in png_files]

# Calculate total width and max height
total_width = sum(img.width for img in images)
max_height = max(img.height for img in images)

# Create new image with combined width and max height
combined_image = Image.new('RGBA', (total_width, max_height))

# Paste images horizontally
x_offset = 0
for img in images:
    combined_image.paste(img, (x_offset, 0))
    x_offset += img.width

# Save the combined image
combined_image.save('combined_image.png')
print("Images combined successfully!")