

provider "aws" {
  region     = "us-east-1"
  access_key = "AKIAT2BTZDEE74OAM64Y"
  secret_key = "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"
}

# Create a VPC
resource "aws_instance" "my-server" {
  ami           = "ami-020cba7c55df1f615"
  instance_type = "t3.micro"

  tags = {
    Name = "My Server"
  }

}
# Create a VPC
resource "aws_vpc" "my-vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "production"
  }
}

resource "aws_subnet" "subnet-1" {
  vpc_id     = aws_vpc.my-vpc.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "Prod-subnet"
  }
}
