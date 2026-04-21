from PIL import Image, ImageOps, ImageDraw
import sys

def make_circle(input_path, output_path):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    
    # Create a square crop first (centered)
    width, height = img.size
    size = min(width, height)
    left = (width - size) / 2
    top = (height - size) / 2
    right = (width + size) / 2
    bottom = (height + size) / 2
    img = img.crop((left, top, right, bottom))
    
    # Create the circular mask
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    
    # Apply mask
    output = ImageOps.fit(img, mask.size, centering=(0.5, 0.5))
    output.putalpha(mask)
    
    # Save the result
    output.save(output_path)
    print(f"Circular icon saved to {output_path}")

if __name__ == "__main__":
    make_circle("public/tab-icon.png", "public/tab-icon.png")
