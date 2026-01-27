pipeline {
    agent any

    options {
        timeout(time: 20, unit: "MINUTES")
        timestamps()
        retry(1)
    }

    environment {
        // Docker registry url
        REGISTRY = "registry.a-star.group"
        // local port registry use this when registry and jenkins-agent is same server
        REGISTRY_LOCAL="localhost:5000"

        // Username for Docker registry
        USERNAME = "devopstovchain"

        // Name of organization, team, project, etc..
        ORGANIZATION_NAME = "hunger"

        // Name of repository, application, etc..
        REPOSITORY_NAME = "frontend-app"
        
        // SSH username
        SSH_USER = "frontend"
        // SSH_USER = "root"

        // Staging server information
        STAGING_VM_IP = "159.223.65.237"
        STAGING_URL = "https://mockup.hedos.finance"
        STAGING_DOCKER_PORT = 80
        STAGING_DOCKER_BIND_PORT = 3800 
        STAGING_ENV_CREDENTIALS_ID = "env-vite-hedos-app-staging"

        // Production server information
        PRODUCTION_VM_IP = "131.153.202.197"
        // PRODUCTION_VM_IP = "178.128.217.190"
        PRODUCTION_URL = "https://hungerfe.hedos.finance"
        PRODUCTION_DOCKER_PORT = 80
        PRODUCTION_DOCKER_BIND_PORT = 3911
        PRODUCTION_ENV_CREDENTIALS_ID = "env-vite-hedos-app-production"

        // Configuation
        DEPLOY_PRODUCTION_MODE = "auto"

        // CredentialsId
        DISCORD_CREDENTIALS_ID = "discord-trava-finance"
    }

    stages {
        stage("Preparation") {
            steps {
                script {
                    env.COMMIT_MESSAGE = sh(returnStdout: true, script: "git log -1 --pretty=%B").trim()
                    env.DEPLOY_COMMIT_HASH = sh(returnStdout: true, script: "git rev-parse HEAD | cut -c1-7").trim()
                    switch(env.BRANCH_NAME) {
                        case "develop":
                            echo "BRANCH_NAME is ${env.BRANCH_NAME}"
                            script {
                                env.ENVIRONMENT = "staging"
                                env.DEPLOY_VM_IP = "${STAGING_VM_IP}"
                                env.DEPLOY_URL = "${STAGING_URL}"
                                env.DOCKER_PORT = "${STAGING_DOCKER_PORT}"
                                env.DOCKER_BIND_PORT = "${STAGING_DOCKER_BIND_PORT}"
                                env.ENV_CREDENTIALS_ID = "${STAGING_ENV_CREDENTIALS_ID}"
                            }
                            break
                        case "release":
                            echo "BRANCH_NAME is ${env.BRANCH_NAME}"
                            script {
                                env.ENVIRONMENT = "production"
                                env.DEPLOY_VM_IP = "${PRODUCTION_VM_IP}"
                                env.DEPLOY_URL = "${PRODUCTION_URL}"
                                env.DOCKER_PORT = "${PRODUCTION_DOCKER_PORT}"
                                env.DOCKER_BIND_PORT = "${PRODUCTION_DOCKER_BIND_PORT}"
                                env.ENV_CREDENTIALS_ID = "${PRODUCTION_ENV_CREDENTIALS_ID}"
                            }
                            break
                        case "master":
                            echo "BRANCH_NAME is ${env.BRANCH_NAME}"
                            script {
                                env.ENVIRONMENT = "staging"
                                env.RELEASE_TAG = sh(returnStdout: true, script: "git tag --points-at HEAD").trim()
                            }
                            break
                        default:
                            currentBuild.result = "ABORTED"
                            return
                    }
                    env.IMAGE_NAME = "${REGISTRY}/${USERNAME}/${ORGANIZATION_NAME}-${REPOSITORY_NAME}-${env.ENVIRONMENT}:${env.DEPLOY_COMMIT_HASH}"
                    env.IMAGE_NAME_LOCAL = "${REGISTRY_LOCAL}/${USERNAME}/${ORGANIZATION_NAME}-${REPOSITORY_NAME}-${env.ENVIRONMENT}:${env.DEPLOY_COMMIT_HASH}"
                    env.CONTAINER_NAME = "${ORGANIZATION_NAME}-${REPOSITORY_NAME}-${env.ENVIRONMENT}"
                }
            }
        }

        stage("Deploy to staging") {
            when {
                expression {
                    return env.ENVIRONMENT == "staging"
                }
            }

            stages {
                stage("Build staging image") {
                    steps {
                        echo "Build staging docker image ..."

                        withCredentials([string(credentialsId: "${DISCORD_CREDENTIALS_ID}", variable: "WEBHOOK_URL")]) {
                            discordSend(
                                description: "\n \
                                💿 **Image:** ${env.IMAGE_NAME} \n \n \
                                🐳 **Container:** ${env.CONTAINER_NAME} \n \n \
                                📟 **Commit Hash:** ${env.DEPLOY_COMMIT_HASH} \n \n \
                                📋 **Commit Message:** ${env.COMMIT_MESSAGE} \n \n \
                                🖥 **IP:** ${env.DEPLOY_VM_IP} \n \n \
                                ⏳ **Status:** Deploying \n \n \
                                🔗 **Link:** ${env.DEPLOY_URL} \n ",
                                footer: "Copyright © ${ORGANIZATION_NAME}",
                                link: env.BUILD_URL,
                                result: "UNSTABLE",
                                title: "Start deploy **${ORGANIZATION_NAME}-${REPOSITORY_NAME}** to ${env.ENVIRONMENT} environment.",
                                webhookURL: WEBHOOK_URL
                            )
                        }

                        checkout scm

                        withCredentials([usernamePassword(credentialsId: 'docker-devopstovchain', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME'),
                                        file(credentialsId: "${env.ENV_CREDENTIALS_ID}", variable: 'ENV_FILE_STAGING')]) {
                            writeFile(file: ".env", text: readFile("${ENV_FILE_STAGING}"), encoding: "UTF-8")
                            sh "docker build -t ${env.IMAGE_NAME_LOCAL} . && \
                                docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${REGISTRY_LOCAL} && \
                                docker push ${env.IMAGE_NAME_LOCAL} && \
                                docker logout && \
                                docker tag ${env.IMAGE_NAME_LOCAL} ${env.IMAGE_NAME} && \
                                docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${REGISTRY} && \
                                docker push ${env.IMAGE_NAME} && \
                                docker logout"
                        }
                    }
                }

                stage("Test staging image") {
                    steps {
                        echo "Testing..."
                        sh "sleep 1"
                        echo "Done!"
                    }
                }

                stage("Delivery to staging") {
                    steps {
                        echo "Delivery to ${env.ENVIRONMENT} environment..."

                        withCredentials([usernamePassword(credentialsId: 'docker-devopstovchain', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                            script {
                                env.LATEST_DEPLOY_COMMIT_HASH = sh(returnStdout: true, script: "ssh -o StrictHostKeyChecking=no -l ${SSH_USER} ${DEPLOY_VM_IP} 'docker ps --filter name=${env.CONTAINER_NAME} --format={{.Image}} | cut -d: -f2'").trim()
                            }

                            sh "ssh -o StrictHostKeyChecking=no -l ${SSH_USER} ${DEPLOY_VM_IP} \
                                'docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${REGISTRY} && \
                                 docker pull ${env.IMAGE_NAME} && \
                                 docker rm -f ${env.CONTAINER_NAME} && \
                                 docker run -d --restart unless-stopped --name ${env.CONTAINER_NAME} -p ${DOCKER_BIND_PORT}:${DOCKER_PORT} ${env.IMAGE_NAME} && \
                                 docker ps && \
                                 docker logout'"
                        }
                    }

                    post {
                        failure {
                            echo "Failure delivery to ${env.ENVIRONMENT} environment"
                            withCredentials([usernamePassword(credentialsId: 'docker-devopstovchain', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                                sh "ssh -o StrictHostKeyChecking=no -l ${SSH_USER} ${DEPLOY_VM_IP} \
                                    'docker rm -f ${env.CONTAINER_NAME} && \
                                     docker run -d --restart unless-stopped --name ${env.CONTAINER_NAME} -p ${DOCKER_BIND_PORT}:${DOCKER_PORT} ${REGISTRY}/${USERNAME}/${ORGANIZATION_NAME}-${REPOSITORY_NAME}-${env.ENVIRONMENT}:${env.LATEST_DEPLOY_COMMIT_HASH} && \
                                     docker ps'"
                            }
                        }
                    }
                }
            }
        }

        stage("Deploy to production") {
            when {
                expression {
                    return env.ENVIRONMENT == "production"
                }
            }

            stages {
                stage("Build production image") {
                    steps {
                        echo "Build ${env.ENVIRONMENT} docker image ..."

                        withCredentials([string(credentialsId: "${DISCORD_CREDENTIALS_ID}", variable: "WEBHOOK_URL")]) {
                            discordSend(
                                description: "\n \
                                💿 **Image:** ${env.IMAGE_NAME} \n \n \
                                🐳 **Container:** ${env.CONTAINER_NAME} \n \n \
                                📟 **Commit Hash:** ${env.DEPLOY_COMMIT_HASH} \n \n \
                                📋 **Commit Message:** ${env.COMMIT_MESSAGE} \n \n \
                                🖥 **IP:** ${env.DEPLOY_VM_IP} \n \n \
                                ⏳ **Status:** Deploying \n \n \
                                🔗 **Link:** ${env.DEPLOY_URL} \n ",
                                footer: "Copyright © ${ORGANIZATION_NAME}",
                                link: env.BUILD_URL,
                                result: "UNSTABLE",
                                title: "Start deploy **${ORGANIZATION_NAME}-${REPOSITORY_NAME}** to ${env.ENVIRONMENT} environment.",
                                webhookURL: WEBHOOK_URL
                            )
                        }

                        checkout scm

                        withCredentials([usernamePassword(credentialsId: 'docker-devopstovchain', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME'),
                                         file(credentialsId: "${env.ENV_CREDENTIALS_ID}", variable: 'ENV_FILE_PRODUCTION')]) {
                            writeFile(file: ".env", text: readFile("${ENV_FILE_PRODUCTION}"), encoding: "UTF-8")
                            sh "docker build -t ${env.IMAGE_NAME} . && \
                                docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${REGISTRY_LOCAL} && \
                                docker push ${env.IMAGE_NAME} && \
                                docker logout"
                        }
                    }
                }

                stage("Test production image") {
                    steps {
                        echo "Testing..."
                        sh "sleep 1"
                        echo "Done!"
                    }
                }

                stage("Delivery to production") {
                    steps {
                        script {
                            if (DEPLOY_PRODUCTION_MODE == 'manual') {
                                input message: 'Deploy to production environment?'
                            }
                        }

                        echo "Delivery to ${env.ENVIRONMENT} environment..."

                        withCredentials([usernamePassword(credentialsId: 'docker-devopstovchain', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                            script {
                                env.LATEST_DEPLOY_COMMIT_HASH = sh(returnStdout: true, script: "ssh -o StrictHostKeyChecking=no -l ${SSH_USER} ${DEPLOY_VM_IP} 'docker ps --filter name=${env.CONTAINER_NAME} --format={{.Image}} | cut -d: -f2'").trim()
                            }

                            sh "ssh -o StrictHostKeyChecking=no -l ${SSH_USER} ${DEPLOY_VM_IP} \
                                'docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${REGISTRY} && \
                                 docker pull ${env.IMAGE_NAME} && \
                                 docker rm -f ${env.CONTAINER_NAME} && \
                                 docker run -d --restart unless-stopped --name ${env.CONTAINER_NAME} -p ${DOCKER_BIND_PORT}:${DOCKER_PORT} ${env.IMAGE_NAME} && \
                                 docker ps && \
                                 docker logout'"
                        }
                    }

                    post {
                        failure {
                            echo "Failure delivery to ${env.ENVIRONMENT} environment"
                            withCredentials([usernamePassword(credentialsId: 'docker-devopstovchain', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                                sh "ssh -o StrictHostKeyChecking=no -l ${SSH_USER} ${DEPLOY_VM_IP} \
                                    'docker rm -f ${env.CONTAINER_NAME} && \
                                     docker run -d --restart unless-stopped --name ${env.CONTAINER_NAME} -p ${DOCKER_BIND_PORT}:${DOCKER_PORT} ${REGISTRY}/${USERNAME}/${ORGANIZATION_NAME}-${REPOSITORY_NAME}-${env.ENVIRONMENT}:${env.LATEST_DEPLOY_COMMIT_HASH} && \
                                     docker ps'"
                            }
                        }
                    }
                }
            }
        }

        // Tagging image
        stage("Tagging image") {
            when {
                expression {
                    return env.ENVIRONMENT == "tagging"
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-devopstovchain', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "ssh -o StrictHostKeyChecking=no -l ${SSH_USER} ${PRODUCTION_VM_IP} \
                        'docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${REGISTRY} && \
                         docker tag \$(docker ps --filter name=${env.CONTAINER_NAME} --format={{.Image}}) ${env.IMAGE_NAME} ${REGISTRY}/${USERNAME}/${ORGANIZATION_NAME}-${REPOSITORY_NAME}:${env.RELEASE_TAG} && \
                         docker push ${REGISTRY}/${USERNAME}/${ORGANIZATION_NAME}-${REPOSITORY_NAME}:${env.RELEASE_TAG} && \
                         docker logout'"
                }
            }
        }
    }

    post {
        success {
            echo "Successful deployment to ${env.ENVIRONMENT}!"
            withCredentials([usernamePassword(credentialsId: 'docker-devopstovchain', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                sh """
                    ssh -o StrictHostKeyChecking=no -l ${SSH_USER} ${DEPLOY_VM_IP} '
                        # 1. Xóa các image dangling (rác, không tên) - An toàn cho mọi người
                        docker image prune -f

                        # 2. Định nghĩa tên Repo đầy đủ để lọc
                        TARGET_REPO="${REGISTRY}/${USERNAME}/${ORGANIZATION_NAME}-${REPOSITORY_NAME}-${env.ENVIRONMENT}"
                        
                        # 3. Liệt kê các image thuộc Repo này, loại trừ tag đang chạy hiện tại, và xóa các image cũ
                        docker images --format "{{.Repository}}:{{.Tag}}" | \
                        grep "\$TARGET_REPO" | \
                        grep -v "${env.DEPLOY_COMMIT_HASH}" | \
                        xargs -r docker rmi || true
                    '
                """
            }
            withCredentials([string(credentialsId: "${DISCORD_CREDENTIALS_ID}", variable: "WEBHOOK_URL")]) {
                discordSend(
                    description: "\n \
                    💿 **Image:** ${env.IMAGE_NAME} \n \n \
                    🐳 **Container:** ${env.CONTAINER_NAME} \n \n \
                    📟 **Commit Hash:** ${env.DEPLOY_COMMIT_HASH} \n \n \
                    📋 **Commit Message:** ${env.COMMIT_MESSAGE} \n \n \
                    🖥 **IP:** ${env.DEPLOY_VM_IP} \n \n \
                    ✅ **Status:** Success \n \n \
                    🔗 **Link:** ${env.DEPLOY_URL} \n ",
                    footer: "Copyright © ${ORGANIZATION_NAME}",
                    link: env.BUILD_URL,
                    result: currentBuild.currentResult,
                    title: "Successful deployment **${ORGANIZATION_NAME}-${REPOSITORY_NAME}** to ${env.ENVIRONMENT} environment.",
                    webhookURL: WEBHOOK_URL
                )
            }
        }

        failure {
            echo "Failure deployment to ${env.ENVIRONMENT}!"
            withCredentials([string(credentialsId: "${DISCORD_CREDENTIALS_ID}", variable: "WEBHOOK_URL")]) {
                discordSend(
                    description: "\n \
                    💿 **Image:** ${env.IMAGE_NAME} \n \n \
                    🐳 **Container:** ${env.CONTAINER_NAME} \n \n \
                    📟 **Commit Hash:** ${env.DEPLOY_COMMIT_HASH} \n \n \
                    📋 **Commit Message:** ${env.COMMIT_MESSAGE} \n \n \
                    🖥 **IP:** ${env.DEPLOY_VM_IP} \n \n \
                    ❌ **Status:** Fail \n \n \
                    🔗 **Link:** ${env.DEPLOY_URL} \n ",
                    footer: "Copyright © ${ORGANIZATION_NAME}",
                    link: env.BUILD_URL,
                    result: currentBuild.currentResult,
                    title: "Failure deployment **${ORGANIZATION_NAME}-${REPOSITORY_NAME}** to ${env.ENVIRONMENT} environment.",
                    webhookURL: WEBHOOK_URL
                )
            }
        }
    }
}