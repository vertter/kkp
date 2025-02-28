import torch
import torch.nn as nn
import torch.optim as optim

# Check if CUDA is available and set PyTorch to use GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Example: Define a simple neural network
class SimpleNet(nn.Module):
    def __init__(self):
        super(SimpleNet, self).__init__()
        self.fc = nn.Linear(784, 10)  # Example: 784 input features, 10 output features for classification

    def forward(self, x):
        x = self.fc(x)
        return x

# Initialize the network
model = SimpleNet().to(device)

# Define a loss function and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)

# Example: Train the model with dummy data
for epoch in range(10):  # loop over the dataset multiple times
    inputs = torch.randn(64, 784).to(device)  # Example: batch size 64, input size 784
    labels = torch.randint(0, 10, (64,)).to(device)  # Example: random labels for batch size 64

    # zero the parameter gradients
    optimizer.zero_grad()

    # forward + backward + optimize
    outputs = model(inputs)
    loss = criterion(outputs, labels)
    loss.backward()
    optimizer.step()

    print(f'Epoch {epoch+1}, Loss: {loss.item()}')

print('Finished Training')

