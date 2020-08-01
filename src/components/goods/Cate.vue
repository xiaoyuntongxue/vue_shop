<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>

      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" 
      :show-row-hover="false" show-index border>
        <!-- 是否有效列 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作列 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClose">
      <el-form :model="addCateForm" ref="addCateFormRef" :rules="addCateFormRules" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
          <el-form-item label="父级分类：">
            <!-- options用来指定数据源 -->
            <!-- props用来指定配置对象 -->
            <el-cascader v-model="selectParentKeys" :options="parentCateList" :props="cascaderProps"
              @change="handleChange" clearable></el-cascader>
          </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClose">
      <el-form :model="editCateForm" ref="editCateFormRef" :rules="editCateFormRules" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Cate',
    data() {
      return {
        // 获取商品分类列表的参数
        queryInfo: {
          // 获取商品等级数
          type: 3,
          // 当前页数
          pagenum: 1,
          // 每页显示的数据数量
          pagesize: 5
        },
        // 商品分类列表数据，默认为空
        cateList: [],
        // 商品分类总数据条数
        total: 0,
        columns: [
          {
            // 列标题名称
            label: '分类名称',
            // 对应列内容的属性名
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            // 表示定义一个自定义插槽
            type: 'template',
            // 表示自定义插槽的名称
            template: 'isOk'
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }
        ],
        // 监听添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        // 添加分类对话框的表单内容
        addCateForm: {
          // 添加的分类名称
          cat_name: '',
          // 父级分类等级，默认为0，表示一级分类
          cat_pid: 0,
          // 分类等级，默认为0，表示一级分类
          cat_level: 0
        },
        // 添加分类对话框的验证规则
        addCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        },
        // 父级分类列表数据
        parentCateList: [],
        // 选中的父级分类的id数组
        selectParentKeys: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },
        // 修改分类对话框的显示与隐藏
        editCateDialogVisible: false,
        // 获取到的修改分类对话框的数据
        editCateForm: {},
        // 修改分类对话框的验证规则
        editCateFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'}
          ]
        }         
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get('categories', { params: this.queryInfo })
        if(res.meta.status !== 200) {
          return this.$message.error('获取商品分类列表失败！')
        }
        // console.log(res.data, 63)
        // 为商品列表赋值
        this.cateList = res.data.result;
        // 为商品列表总数据条数赋值
        this.total = res.data.total
      },
      // 控制pagesize的变化
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      // 控制pagenum的变化
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      // 监听添加分类对话框显示
      showAddCateDialog() {
        // 在添加分类对话框显示前获取父级分类的数据
        this.getParentCateList();
        this.addCateDialogVisible = true
      },
      // 获取父级分类菜单项
      async getParentCateList() {
        const {data: res} = await this.$http.get('categories',{ params: { type: 2 }})
        if(res.meta.status !== 200) {
          return this.$message.error('获取父级分类数据失败！')
        }
        // console.log(res.data,179);
        this.parentCateList = res.data
      },
      // 监听选择项改变的事件
      handleChange() {
        // console.log(this.selectParentKeys);
        // 判断是否选择了父级分类，选择了几级父级分类
        if (this.selectParentKeys.length > 0) {
          // 父级分类的id为选择的父级分类的最后一项
          this.addCateForm.cat_pid = this.selectParentKeys[this.selectParentKeys.length - 1]
          // 分类等级与数组长度一致，0表示一级，1表示二级，2表示三级
          this.addCateForm.cat_level = this.selectParentKeys.length
          return
        } else {
          // 如果没有选择父级分类，则分类等级为一级
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      // 点击确定,添加分类
      addCate() {
        console.log(this.addCateForm);
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post('categories', this.addCateForm)
          // console.log(res.data, 206);
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败！')
          }
          this.$message.success('添加分类成功！')
          // 刷新分类列表
          this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      // 监听添加分类对话框的关闭事件，重置表单
      addCateDialogClose() {
        this.$refs.addCateFormRef.resetFields()
        // this.addCateForm.cat_level = 0
        // this.addCateForm.cat_pid = 0
        this.selectParentKeys = []
      },
      // 监听编辑分类对话框事件
      async showEditDialog(id) {
        // console.log(id);
        this.editCateDialogVisible = true
        const {data: res} = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询分类信息失败！')
        }
        this.editCateForm = res.data
        // console.log(res.data);   
      },
      // 监听修改分类对话框的关闭事件
      editCateDialogClose() {
        this.$refs.editCateFormRef.resetFields()
      },
      // 删除分类
      async removeCate(id) {
        // 弹框提示是否删除分类
        const confirmResult = await this.$confirm('此操作将永久删除该分类，是否继续?','提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult === 'cancel') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('categories/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除分类失败！')
        }
        this.$message.success('删除分类成功！')
        // 刷新分类列表
        this.getCateList();
      },
      // 点击确定，修改分类
      editCate() {
        this.$refs.editCateFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, {cat_name: this.editCateForm.cat_name}) 
          if(res.meta.status !== 200) {
            return this.$message.error('修改分类失败！')
          }
          this.$message.success('修改分类成功！')
          this.getCateList()
          this.editCateDialogVisible = false
        })
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
  .treeTable {
    margin-top: 15px;
  }
  .el-pagination {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>