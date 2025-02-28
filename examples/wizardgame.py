import pygame
import sys

# Initialize Pygame
pygame.init()

# Set up the display
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Wizard Platformer")

# Colors
WHITE = (255, 255, 255)
BLUE = (0, 0, 255)
PURPLE = (128, 0, 128)

# Wizard properties
wizard_width = 40
wizard_height = 60
wizard_x = WINDOW_WIDTH // 4
wizard_y = WINDOW_HEIGHT - wizard_height - 10
wizard_speed = 5
wizard_jump_power = -15
wizard_velocity_y = 0
gravity = 0.8

# Platform properties
platform = pygame.Rect(0, WINDOW_HEIGHT - 10, WINDOW_WIDTH, 10)

# Game loop
clock = pygame.time.Clock()
running = True

while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            # Jump only if wizard is on the ground
            if event.key == pygame.K_SPACE and wizard_y + wizard_height >= platform.top:
                wizard_velocity_y = wizard_jump_power

    # Get keyboard state
    keys = pygame.key.get_pressed()
    
    # Horizontal movement
    if keys[pygame.K_LEFT]:
        wizard_x -= wizard_speed
    if keys[pygame.K_RIGHT]:
        wizard_x += wizard_speed

    # Apply gravity and vertical movement
    wizard_velocity_y += gravity
    wizard_y += wizard_velocity_y

    # Keep wizard within screen bounds
    if wizard_x < 0:
        wizard_x = 0
    if wizard_x > WINDOW_WIDTH - wizard_width:
        wizard_x = WINDOW_WIDTH - wizard_width

    # Platform collision
    if wizard_y + wizard_height > platform.top:
        wizard_y = platform.top - wizard_height
        wizard_velocity_y = 0

    # Clear screen
    screen.fill(WHITE)

    # Draw platform
    pygame.draw.rect(screen, BLUE, platform)

    # Draw wizard (simple rectangle for now)
    pygame.draw.rect(screen, PURPLE, (wizard_x, wizard_y, wizard_width, wizard_height))

    # Update display
    pygame.display.flip()

    # Control game speed
    clock.tick(60)

pygame.quit()
sys.exit()