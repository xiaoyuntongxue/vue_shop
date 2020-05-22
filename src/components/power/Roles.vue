<template>
  <div>
    <!-- 头部面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图模块 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色管理列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 扩展列 -->
        <el-table-column type="expand" width="80px">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1 === 0 ? 'bdtop' : 'bdbottom', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 放置一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 放置二级或三级权限 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <!-- 放置二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 放置三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 序号列 -->
        <el-table-column type="index" label="序号" width="100px"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="350px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" size="mini"  icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button type="warning" size="mini"  icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色信息框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addFormClose">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色信息框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editFormClose">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限信息框 -->
    <el-dialog title="分配权限" :visible.sync="showRightDialogVisible" width="50%" @close="removeDefKeys">
      <!-- 权限树 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data() {
      return {
        // 角色列表数据
        rolesList: [],
        // 控制添加角色信息框的弹出和隐藏
        addDialogVisible: false,
        // 添加角色信息框的内容绑定
        addForm: {
          roleName: '',
          roleDesc: ''
        },
        // 查询到的角色信息
        editForm: {},
        // 控制修改角色信息框的弹出和隐藏
        editDialogVisible: false,
        // 添加角色信息框验证规则
        addFormRules: {
          roleName: [
            { required: true, message: '请输入角色名', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' },
            { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
          ]
        },
        // 修改角色信息框验证
        editFormRules: {
          roleName: [
            { required: true, message: '请输入角色名', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' },
            { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
          ]
        },
        // 是否显示分配权限信息框
        showRightDialogVisible: false,
        // 获取的权限数据
        rightsList: [],
        // 属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        // 被分配的权限id
        defKeys: [],
        // 获取到的角色id
        roleId: ''
      }
    },
    created() {
      this.getRolesList();
    },
    methods: {
      // 获取角色列表
      async getRolesList() {
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败!')
        }
        this.rolesList = res.data
        // console.log(this.rolesList,130);
      },
      // 监听添加角色事件
      addRole() {
        // 验证表单信息是否符合验证规则
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post('roles',this.addForm)
          // console.log(res,150);
          if (res.meta.status !== 201) {
            return this.$message.error('添加角色失败!')
          }
          this.$message.success('添加角色成功!')
          // 添加角色信息框隐藏
          this.addDialogVisible = false
          // 刷新角色列表
          this.getRolesList();
        })
      },
      // 监听添加角色信息框关闭并重置
      addFormClose() {
        this.$refs.addFormRef.resetFields();
      },
      // 监听获取角色信息事件
      async showEditDialog(id) {
        this.editDialogVisible = true;
        const {data: res} = await this.$http.get('roles/' + id)
        // console.log(res,143);
        if (res.meta.status !== 200) {
          return this.$message.error('查询角色失败!')
        }
        this.editForm = res.data
      },
      // 监听修改角色信息框关闭并重置
      editFormClose() {
        this.$refs.editFormRef.resetFields();
      },
      // 监听修改角色信息框事件
      editRole() {
        // 验证表单信息是否符合验证规则
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.put('roles/' + this.editForm.roleId, {roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc}) 
          if (res.meta.status !== 200) {
            return this.$message.error('修改角色失败!')
          }
          this.$message.success('修改角色成功!')
          this.editDialogVisible = false
          this.getRolesList()
        })
      },
      // 通过id删除角色
      async removeRoleById(id) {
        // 弹框提示是否删除角色
        const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult === 'cancel') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('roles/' + id)
        
        if(res.meta.status !== 200) {
          return this.$message.error('删除角色失败!');
        }
        this.$message.success('删除角色成功!');
        this.getRolesList();
      },
      // 通过id删除角色权限
      async removeRightById(role,rightId) {
        // 弹框提示是否删除权限
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult === 'cancel') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        
        if(res.meta.status !== 200) {
          return this.$message.error('删除权限失败!');
        }
        this.$message.success('删除权限成功!');
        // 把服务器返回的最新的权限，直接赋值给当前角色的children，这样不会造成整个角色列表的刷新
        role.children = res.data;
        // 会造成整个角色列表的刷新
        // this.getRolesList();
      },
      // 监听分配权限信息框
      async showSetRightDialog(role) {
        this.roleId = role.id
        const {data: res} = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败!');
        }
        this.rightsList = res.data;
        // console.log(this.rightsList,272);
        // 递归获取三级节点的id
        this.getLeafKeys(role,this.defKeys);
        this.showRightDialogVisible = true;
      },
      // 通过递归获取所有的三级权限id ，并保存到数组中
      getLeafKeys(node,arr) {
        // node: 拿到的哪个角色children属性
        // arr: 获取到的权限id数组
        // 拿到三级权限id
        // 如果当前node节点无children属性，则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        // 如果没有return 代表不是三级节点，则对当前节点进行筛选，找出其下的子节点
        node.children.forEach(item => {
          return this.getLeafKeys(item,arr)
        })
      },
      // 清除每次保存在defKeys中的id
      removeDefKeys() {
        this.defKeys = [];
      },
      // 点击确定给角色分配权限
      async setRoleRight() {
        // console.log(this.$refs.treeRef,299);
        // 获取所有选中和半选中的权限id
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        // 获取到的是数组
        // console.log(keys,306);
        const idStr = keys.join(',')
        // 转换为字符串
        // console.log(idStr,309);
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
        if (res.meta.status !== 200) {
          return this.$message.error('权限分配失败!')
        }
        this.$message.success('权限分配成功!')
        this.getRolesList();
        this.showRightDialogVisible = false;
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-breadcrumb {
    margin-bottom: 15px;
    font-size: 12px;
  }
  .el-table {
    margin-top: 15px;
  }
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>