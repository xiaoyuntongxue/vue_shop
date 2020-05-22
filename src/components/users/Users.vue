<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <!-- :data中放的是列表的数据源 -->
      <el-table :data="userslist" border stripe>
        <!-- 插入序号列 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- {{scope.row}}表示当前行的所有信息 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
       :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClose">
      <div>
        <p>当前的用户： {{userInfo.username}}</p>
        <p>当前的角色： {{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUsersRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Users',
    data() {
      // 自定义邮箱验证规则
      const checkEmail = (rule, value, callback) => {
        // 邮箱验证规则
        const regEmail = /^([a-zA-z0-9_-])+@([a-zA-z0-9_-])+(\.[a-zA-z0-9_-])+/
        if(regEmail.test(value)) {
          return callback()
        }
        callback(new Error('邮箱格式不正确'))
      }
      const checkMobile = (rule, value, callback) => {
        // 邮箱验证规则
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if(regMobile.test(value)) {
          return callback()
        }
        callback(new Error('手机号码格式不正确'))
      }
      return {
        // 获取用户列表的参数对象
        queryInfo: {
          query: '',
          // 当前页数
          pagenum: 1,
          // 每页显示的数据个数
          pagesize: 2
        },
        userslist: [],
        total: 0,
        // 控制添加用户对话框是否显示
        addDialogVisible: false,
        // 添加的用户信息
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 控制修改用户对话框是否显示
        editDialogVisible: false,
        // 查询到的用户信息
        editForm: {},
        // 添加用户表单信息的验证规则
        addFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 修改用户表单信息的验证规则
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 控制分配角色对话框显示
        setRoleDialogVisible: false,
        // 获取到的角色列表
        rolesList: {},
        // 要被分配角色的用户信息
        userInfo: {},
        // 被选中的角色的id
        selectedRoleId: ''
      }
    },
    created() {
      this.getUsersList();
    },
    methods: {
      // 获取用户列表
      async getUsersList() {
        const {data: res} = await this.$http.get('users', {params: this.queryInfo});
        if (res.meta.status !== 200) return this.$message.error('获取用户列表失败');
        this.userslist = res.data.users;
        this.total = res.data.total;
        // console.log(res, 'Users组件，78');      
      },
      // 监听每页显示数据的个数
      handleSizeChange(newSize) {
        // console.log(newSize,85);
        this.queryInfo.pagesize = newSize;
        this.getUsersList();
        
      },
      // 监听显示的当前页数
      handleCurrentChange(newPage) {
        // console.log(newPage,89);
        this.queryInfo.pagenum = newPage
        this.getUsersList();
      },
      // 监听用户状态的改变
      async userStateChange(userinfo) {
        const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        // console.log(userinfo,102);
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('设置用户状态失败')
        }
        this.$message.success('设置用户状态成功')            
      },
      // 监听添加用户对话框的关闭
      addDialogClose() {
        this.$refs.addFormRef.resetFields();
      },
      // 监听添加用户事件
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const {data:res} = await this.$http.post('users',this.addForm)
          // console.log(res,188);
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败!')
          }
          this.$message.success('添加用户成功!')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false;
          // 刷新用户列表
          this.getUsersList();
        })
      },
      // 修改用户信息弹框
      async showEditDialog(id) {
        this.editDialogVisible = true
        const {data: res} = await this.$http.get('users/' + id)
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败!')
        }
        this.editForm = res.data
        // console.log(this.editForm,243)  
      },
      // 监听修改用户对话框的关闭
      editDialogClose() {
        this.$refs.editFormRef.resetFields();
      },
      // 修改用户信息
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if(!valid) return 
          const {data: res} = await this.$http.put('users/' + this.editForm.id, {email: this.editForm.email, mobile: this.editForm.mobile})
          // console.log(res,254);
          if (res.meta.status !== 200) {
            return this.$message.error('修改用户信息失败!')
          }
          this.$message.success('修改用户信息成功!')
          this.editDialogVisible = false
          this.getUsersList();
        })
      },
      // 通过用户的Id删除用户
      async removeUserById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => {
          return err
        })
        // 如果确认删除，后台返回confirm
        // 如果取消删除，后台返回cancel
        // console.log(confirmResult);
        if(confirmResult === 'cancel') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('users/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除用户失败!');
        }
        this.$message.success('删除用户信息成功!');
        this.getUsersList();
      },
      // 监听分配角色事件
      async setRole(userInfo) {
        this.userInfo = userInfo
        this.setRoleDialogVisible = true
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败!')
        }
        this.rolesList = res.data
        // console.log(this.rolesList,319);
      },
      // 点击确定给用户分配角色
      async saveUsersRole() {
        // 判断当前角色与选择的角色是否相同
        if (!this.selectedRoleId) {
          return this.$message.error('请选择新的角色!')
        }
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
        if (res.meta.status !== 200) {
          this.$message.error('角色分配失败!')
        }
        this.$message.success('角色分配成功!')
        // console.log(res,331);
        this.getUsersList();
        this.setRoleDialogVisible = false
      },
      // 监听分配角色对话框的关闭
      setRoleDialogClose() {
        this.selectedRoleId = ''
        this.userInfo = {}
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-breadcrumb {
    margin-bottom: 15px;
    font-size: 12px;
  }
  .el-card {
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
  }
  .el-table {
    margin-top: 15px;
    font-size: 12px;
    margin-bottom: 15px;
  }
</style>