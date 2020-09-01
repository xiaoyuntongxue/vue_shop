<template>
  <div>
    <!-- 面包屑导航栏区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告弹框区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>

      <!-- 商品分类选择区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类的级联选择器 -->
          <el-cascader v-model="selectCateKeys" :options="cateList" :props="cateListProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- Tab页签面板 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button size="mini" type="primary" :disabled="!isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyTableData" stripe border style="width: 100%">
              <!-- 扩展列 -->
              <el-table-column type="expand" width="80">
                <template slot-scope="scope">
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="removeTagById(i, scope.row)">{{item}}</el-tag>
                  <!-- 文本输入框 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                   @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                  <!-- 按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 序号列 -->
              <el-table-column type="index" label="序号" width="80"></el-table-column>
              <!-- 参数名称列 -->
              <el-table-column prop="attr_name" label="参数名称"></el-table-column>
              <!-- 操作列 -->
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <!-- 修改操作 -->
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                  <!-- 删除操作 -->
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button size="mini" type="primary" :disabled="!isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" stripe border style="width: 100%">
              <!-- 扩展列 -->
              <el-table-column type="expand" width="80">
                <template slot-scope="scope">
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="removeTagById(i, scope.row)">{{item}}</el-tag>
                  <!-- 文本输入框 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                   @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                  <!-- 按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 序号列 -->
              <el-table-column type="index" label="序号" width="80"></el-table-column>
              <!-- 参数名称列 -->
              <el-table-column prop="attr_name" label="属性名称"></el-table-column>
              <!-- 操作列 -->
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <!-- 修改操作 -->
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                  <!-- 删除操作 -->
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数和静态属性对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addParamsClose">
      <el-form :model="addParamsForm" :rules="addParamsRules" ref="addParamsRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改动态参数和静态属性对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editParamsClose">
      <el-form :model="editParamsForm" :rules="editParamsRules" ref="editParamsRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Params',
    data() {
      return {
        // 获取到的商品分类数据
        cateList: [],
        cateListProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 选中的选项数组
        selectCateKeys: [],
        // 指定当前选中的标签页
        activeName: 'many',
        // 获取到的动态参数数据
        manyTableData: [],
        // 获取到的静态属性数据
        onlyTableData: [],
        // 监听添加参数对话框的显示与隐藏
        addDialogVisible: false,
        // 添加参数表单数据
        addParamsForm: {
          attr_name: ''
        },
        // 添加动态参数和静态属性表单数据验证规则
        addParamsRules: {
          attr_name: [
            { required: true, message: '请添加参数名称', trigger: 'blur' }
          ]
        },
        // 监听修改参数对话框的显示与隐藏
        editDialogVisible: false,
        // 修改参数表单数据
        editParamsForm: {},
        editParamsRules: {
          attr_name: [
            { required: true, message: '请添加参数名称', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getCateList()
    },
    computed: {
      // 决定添加参数和添加属性按钮是否可以点击
      isBtnDisabled() {
        return this.selectCateKeys.length === 3
      },
      // 获取第三级分类的id
      cateId() {
        if (this.selectCateKeys.length === 3) {
          return this.selectCateKeys[2]
        }
        return null
      },
      // 动态获取添加参数对话框的标题
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    },
    methods: {
      // 获取级联选择器中的数据
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类信息失败！')
        }
        // 为商品分类赋值
        this.cateList = res.data
        // console.log(this.cateList, 47);
      },
      // 监听级联选择器的变化
      handleChange() {
        // console.log(this.selectCateKeys)
        this.getParamsData()
      },
      // 监听Tab页签的点击事件
      handleClick() {
        // console.log(this.activeName);
        this.getParamsData()
      },
      // 监听添加参数事件
      addParams() {
        this.$refs.addParamsRef.validate(async valid => {
          if (!valid)  return
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败！')
          }
          this.$message.success('添加参数成功！')
          this.addDialogVisible = false
          this.getParamsData()
        })
      },
      // 获取参数的列表数据
      async getParamsData() {
        if (this.selectCateKeys.length !== 3) {
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
         // 根据所选分类id，和当前选中的面板，获取对应的参数
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
          params: {
            sel: this.activeName
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取数据列表失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals? item.attr_vals.split(',') : []
          // 给每个输入框控制自己的显示控制与隐藏
          item.inputVisible = false
          // 让每个输入框控制自己的输入内容
          item.inputValue = ''
        })
        console.log(res.data);
        // 判断获取到的是动态参数还是静态属性的数据
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      // 监听添加动态参数和静态属性表单的关闭事件
      addParamsClose() {
        // 清除表单的验证规则
        this.$refs.addParamsRef.resetFields()
      },
      // 监听修改参数事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{
          params: {
            attr_sel: this.activeName
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败！')
        }
        this.editParamsForm = res.data
        this.editDialogVisible = true
      },
      // 点击确定，完成修改参数操作
      editParams() {
        this.$refs.editParamsRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,{
              attr_name: this.editParamsForm.attr_name,
              attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败!')
          }
            this.$message.success('修改参数成功！')
            this.getParamsData()
            this.editDialogVisible = false
        })
      },
      // 监听修改参数对话款哪个的关闭事件
      editParamsClose() {
        this.$refs.editParamsRef.resetFields()
      },
      // 监听删除参数事件
      async removeParams(id) {
         // 弹框提示是否删除参数
        const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续?','提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult === 'cancel') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败！')
        }
        this.$message.success('删除参数成功！')
        this.getParamsData()
      },
      // 监听键盘按下enter键弹起和输入框失去鼠标焦点时触发的事件
      handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        row.attr_vals.push(row.inputValue)
        row.inputValue = ''
        row.inputVisible = false
        // 发起请求，保存这次操作
        this.saveAttrVals(row)
        console.log('ok');
      },
      async saveAttrVals(row) {
        // 发起请求，保存这次操作
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
      },
      // 监听点击+ New Tag按钮事件
      showInput(row) {
        row.inputVisible = true
        // 让文本输入框自动获取焦点
        // $nextTick方法的作用，就是当页面上的元素被重新渲染之后，才会执行回调函数中代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
        console.log('show');
      },
      // 监听参数移除事件
      async removeTagById(i, row) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?','提示',{
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult === 'cancel') {
          return this.$message.info('已取消删除')
        }
        row.attr_vals.splice(i, 1)
        // 发起请求，保存这次操作
        this.saveAttrVals(row)
        console.log('remove');
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
  .cat_opt {
    margin: 15px 0;
  }
  .el-table {
    margin-top: 15px;
  }
  .el-tag {
    margin-right: 15px;
    margin-bottom: 15px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>