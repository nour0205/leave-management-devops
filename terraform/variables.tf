# General
variable "aws_region" {
  description = "AWS region to deploy in"
  default     = "us-east-1"
}

# Network
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for Subnet"
  default     = "10.0.1.0/24"
}

variable "private_ip" {
  description = "Private IP for the instance"
  default     = "10.0.1.50"
}

# EC2
variable "ami_id" {
  description = "AMI ID for EC2 instance"
  default     = "ami-020cba7c55df1f615" # Ubuntu 22.04
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.micro"
}

variable "key_pair" {
  description = "Name of the existing EC2 key pair"
  default     = "main-key"
}
