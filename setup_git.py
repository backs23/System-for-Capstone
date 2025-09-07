#!/usr/bin/env python3
"""
Git Setup Script for AquaTech Deployment

This script helps you set up Git and push your code to GitHub for deployment.
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=True, text=True)
        print(f"✅ {description} - Success")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed")
        if e.stderr:
            print(f"   Error: {e.stderr.strip()}")
        return False

def check_git_installed():
    """Check if Git is installed"""
    try:
        result = subprocess.run("git --version", shell=True, check=True, 
                              capture_output=True, text=True)
        print(f"✅ Git is installed: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError:
        print("❌ Git is not installed")
        print("📥 Please install Git from: https://git-scm.com/downloads")
        return False

def setup_git_repo():
    """Initialize Git repository and set it up for deployment"""
    print("🚀 Setting up Git repository for deployment")
    print("=" * 50)
    
    # Check if Git is installed
    if not check_git_installed():
        return False
    
    # Get GitHub username
    print("\n📝 GitHub Setup")
    github_username = input("Enter your GitHub username: ").strip()
    if not github_username:
        print("❌ GitHub username is required")
        return False
    
    repo_name = input("Enter repository name (default: aquatech-website): ").strip()
    if not repo_name:
        repo_name = "aquatech-website"
    
    print(f"\n🔧 Setting up repository: {github_username}/{repo_name}")
    
    # Initialize Git repo
    commands = [
        ("git init", "Initializing Git repository"),
        ("git add .", "Adding all files to Git"),
        ('git commit -m "Initial AquaTech website deployment"', "Creating initial commit"),
        (f"git remote add origin https://github.com/{github_username}/{repo_name}.git", "Adding GitHub remote"),
        ("git branch -M main", "Setting main branch")
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            print(f"\n❌ Setup failed at: {description}")
            return False
    
    print("\n✅ Git repository setup complete!")
    print("\n📋 Next Steps:")
    print("1. Create a repository on GitHub:")
    print(f"   - Go to: https://github.com/new")
    print(f"   - Repository name: {repo_name}")
    print(f"   - Make it PUBLIC (required for free hosting)")
    print(f"   - DON'T initialize with README")
    print("\n2. Push your code:")
    print(f"   git push -u origin main")
    print("\n3. Deploy on Render:")
    print("   - Go to: https://render.com")
    print("   - Sign up with GitHub")
    print("   - Create Web Service")
    print(f"   - Connect repository: {github_username}/{repo_name}")
    
    return True

def push_to_github():
    """Push code to GitHub"""
    print("\n🚀 Pushing code to GitHub...")
    
    # Check if remote exists
    try:
        result = subprocess.run("git remote -v", shell=True, check=True, 
                              capture_output=True, text=True)
        if "origin" not in result.stdout:
            print("❌ No GitHub remote found. Please run setup first.")
            return False
    except subprocess.CalledProcessError:
        print("❌ Not a Git repository. Please run setup first.")
        return False
    
    # Push to GitHub
    if run_command("git push -u origin main", "Pushing to GitHub"):
        print("\n🎉 Code successfully pushed to GitHub!")
        print("\nYour code is now ready for deployment on:")
        print("- Render: https://render.com")
        print("- Railway: https://railway.app") 
        print("- Heroku: https://heroku.com")
        return True
    else:
        print("\n❌ Push failed. Make sure:")
        print("1. GitHub repository exists and is public")
        print("2. You have push permissions")
        print("3. Repository name matches exactly")
        return False

def main():
    """Main function"""
    print("🌐 AquaTech Website Deployment Setup")
    print("=" * 40)
    
    print("\nChoose an option:")
    print("1. Setup Git repository (first time)")
    print("2. Push code to GitHub")
    print("3. Show deployment instructions")
    print("4. Check deployment status")
    
    try:
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            setup_git_repo()
        elif choice == '2':
            push_to_github()
        elif choice == '3':
            print("\n📖 Deployment Instructions:")
            print("See DEPLOYMENT_GUIDE.md for complete instructions")
            print("\nQuick steps:")
            print("1. Run this script (option 1) to setup Git")
            print("2. Create GitHub repository")
            print("3. Push code (option 2)")
            print("4. Deploy on Render/Railway/Heroku")
        elif choice == '4':
            print("\n🔍 Checking deployment status...")
            run_command("git status", "Git status")
            run_command("git remote -v", "Git remotes")
        else:
            print("❌ Invalid choice. Please enter 1-4.")
            
    except KeyboardInterrupt:
        print("\n\n👋 Setup cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
