pipeline {
    agent any

    environment {
        GITHUB_TOKEN = credentials('f7f4594e-882e-423b-b00e-5c3cc9049951')
        PROJECT_DIR = '/home/tara/backend/tara-dev/hrms-system-backend'  // Directory for Project A
        NODE_VERSION = 'NODE'  // Node.js installation in Jenkins
        PM2_APP_ID = '1'  // Change this to the correct PM2 app ID or name
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    dir("${PROJECT_DIR}") {  // Navigate to Project A directory
                        checkout scm
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    dir("${PROJECT_DIR}") {  // Ensure commands run inside Project A
                        tool NODE_VERSION  
                        def npmCommand = isUnix() ? 'npm' : 'npm.cmd'
                        sh "${npmCommand} install"
                    }
                }
            }
        }

        stage('Restart PM2 Process') {
            steps {
                script {
                    sh "pm2 restart ${PM2_APP_ID}"  // Restart only Project A
                }
            }
        }
    }
}
