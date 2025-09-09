pipeline {
    agent any
    triggers {
        pollSCM('')
    }
    options {
        timeout(time: 30, unit: 'MINUTES')
    }
    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: '要构建的Git分支')
        string(name: 'VERSION', defaultValue: '', description: '镜像版本标签 (留空则使用Git Commit短哈希)')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: '跳过测试步骤')
        booleanParam(name: 'PUSH_TO_REGISTRY', defaultValue: false, description: '是否推送到镜像仓库')
    }
    environment {
        REGISTRY = "harbor.dhr2333.cn/beancount-trans"
        IMAGE_NAME = "beancount-trans-docs"
    }
    stages {
        stage('初始化') {
            steps {
                script {
                    echo "开始构建 Beancount-Trans-Docs 项目"
                    echo "分支: ${params.BRANCH}"
                    echo "镜像标签参数: ${params.VERSION}"
                    echo "工作目录: ${env.WORKSPACE}"
                }
            }
        }

        stage('代码检出') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${params.BRANCH}"]],
                    extensions: [],
                    userRemoteConfigs: [[
                        url: 'https://github.com/dhr2333/Beancount-Trans-Docs.git',
                        credentialsId: '8a235621-ec9f-4f59-97c5-225b1c22764e'
                    ]]
                ])
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    
                    env.IMAGE_TAG = params.VERSION ?: "git-${env.GIT_COMMIT_SHORT}"
                    
                    echo "Git Commit短哈希: ${env.GIT_COMMIT_SHORT}"
                    echo "最终镜像标签: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('构建Docker镜像') {
            steps {
                script {
                    docker.build("${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}", "--rm .")
                }
            }
        }

        stage('推送镜像') {
            when {
                expression { return params.PUSH_TO_REGISTRY }
            }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-registry-cred',
                        usernameVariable: 'REGISTRY_USER',
                        passwordVariable: 'REGISTRY_PASSWORD'
                    )]) {
                        sh "echo ${REGISTRY_PASSWORD} | docker login -u ${REGISTRY_USER} --password-stdin ${env.REGISTRY}"
                    }
                    
                    sh "docker tag ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                    sh "docker push ${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                    
                    if (params.BRANCH == 'main' || params.BRANCH == 'master') {
                        sh "docker tag ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.REGISTRY}/${env.IMAGE_NAME}:latest"
                        sh "docker push ${env.REGISTRY}/${env.IMAGE_NAME}:latest"
                    }
                }
            }
        }

		stage('部署到服务器') {
		    steps {
		        script {
		            sshagent([env.SSH_CREDENTIALS_ID]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} root@${env.DEPLOY_SERVER} "cd /root/Manage && docker compose -f docker-compose-beancount-trans-docs.yaml down && sed -i 's|image:.*|image: ${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}|' docker-compose-beancount-trans-docs.yaml && docker compose -f docker-compose-beancount-trans-docs.yaml up -d"
                        """
		            }
		        }
		    }
		}
    }
    post {
        always {
            cleanWs()
        }
        success {
            script {
                echo "Beancount-Trans-Docs 项目构建成功!"
                if (params.PUSH_TO_REGISTRY) {
                    echo "镜像已推送到: ${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
            }
        }
        failure {
            echo "Beancount-Trans-Docs 项目构建失败!"
        }
    }
}