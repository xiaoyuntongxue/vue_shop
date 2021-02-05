<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 绘制头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 表单输入区域 -->
      <el-form ref="loginFormRef" label-width="0" class="login_form" :model="loginForm" :rules="loginFormRules">
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    // 表单绑定的数据对象
    data() {
      return {
        loginForm: {
          username: 'admin',
          password: '123456'
        },
      // 表单的输入规则
        loginFormRules: {
          // 用户名的验证规则
          username: [
            { required: true, message: '请输入登录名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          // 密码的验证规则
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        }
      }     
    },
    methods: {
      // 重置表单
      resetLoginForm() {
        // console.log(this);
        this.$refs.loginFormRef.resetFields();
      },
      // 登录验证
      login() {
        this.$refs.loginFormRef.validate( async valid => {
          // console.log(valid);
          if (!valid) return;
          // {data: res} 数据解构
          const {data: res} = await this.$http.post('login',this.loginForm);
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('登录失败!用户名或密码错误!');
          this.$message.success('登录成功!')
          window.sessionStorage.setItem('token',res.data.token);
          this.$router.push('/home');         
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    height: 100%;
    background-color: #2b4b6b;
  }
  .login_box {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 450px;
    height: 300px;
    background-color: #fff;
    transform: translate(-50%,-50%);
    border-radius: 5px;

    .avatar_box {
      position: absolute;
      left: 50%;
      width: 130px;
      height: 130px;
      padding: 10px;
      background-color: #fff;
      border: 1px solid #eee;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      transform: translate(-50%,-50%);

      img {
        width: 100%;
        height: 100%;
        background-color: #eee;
        border-radius: 50%;
      }
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>