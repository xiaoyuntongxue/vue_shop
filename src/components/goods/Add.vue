<template>
  <div>
    <!-- 面包屑导航栏区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 添加商品步骤条 -->
      <el-steps :active="parseInt(activeIndex)" :space="300" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <!-- el-tabs里面必须包的是el-tab-pane,所以表单只能放在el-tabs外面,在el-tab-pane里放表单元素 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="tabPosition" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 多选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="vals" v-for="(vals, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片上传到的后台API地址 -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
              list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
            <!-- 图片预览对话框 -->
            <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
              <img class="imageWidth" :src="imageUrl" alt="">
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'Add',
    data() {
      return {
        // 控制tab栏的显示位置
        tabPosition: 'left',
        // 控制当前活跃的步骤
        activeIndex: '0',
        // 添加商品表单内容
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          // 商品选中项的数组
          goods_cat: [],
          // 上传的图片数组
          pics: [],
          // 商品的详情描述
          goods_introduce: '',
          // 商品的参数和属性数组
          attrs: []
        },
        // 表单验证规则
        addFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请输入商品分类', trigger: 'blur' }
          ]
        },
        // 获取到的商品分类参数
        cateList: [],
        // 级联选择器中的各项
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 获取到的动态参数列表数据
        manyTableData: [],
        // 获取到的静态属性列表数据
        onlyTableData: [],
        // 图片上传到后台的URL地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        // 手动配置请求头
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        // 控制图片预览对话框的显示与隐藏
        previewVisible: false,
        // 预览的图片路径
        imageUrl: ''
      }
    }, 
    created() {
      this.getCateList()
    },
    methods: {
      // 获取商品分类
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败！');
        }
        this.cateList = res.data
      },
      // 当点击项发生变化时触发
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },
      // 切换标签页之前的钩子
      beforeTabLeave(activeName, oldActiveName) {
        // 当位于第一个标签页且没有选择三级商品分类时，无法切换标签页
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品分类！')
          return false
        }
      },
      // tab被选中时触发的事件
      async tabClicked() {
        // 证明点击的是商品参数标签
        if (this.activeIndex === '1') {
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {
              sel: 'many'
            }
          })
          if (res.meta.status !== 200) {
            return this.$message.error('获取动态参数失败！')
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length ? item.attr_vals.split(',') : []
          })
          this.manyTableData = res.data
          // 证明选择的是静态属性标签
        } else if (this.activeIndex === '2') {
           const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {
              sel: 'only'
            }
          })
          if (res.meta.status !== 200) {
            return this.$message.error('获取静态属性失败！')
          }
          this.onlyTableData = res.data
        }
      },
      // 图片的预览效果
      handlePreview(file) {
        this.imageUrl = file.url
        this.previewVisible = true
      },
      // 图片的移除操作
      handleRemove(file) {
        console.log(file);
        // 获取将要删除的图片的临时路径
        const picPath = file.response.data.tmp_path
        // 找到删除的图片的索引值
        const i = this.addForm.pics.findIndex(x => x.pics === picPath)
        // 根据索引值移除图片
        this.addForm.pics.splice(i, 1)
      },
      // 文件上传成功时的钩子
      handleSuccess(response) {
        // 拼接得到一个图片信息对象
        const picsInfo = {
          pic: response.data.tmp_path
        }
        // 将图片数组对象push到pics数组中
        this.addForm.pics.push(picsInfo)
      },
      // 添加商品
      add() {
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) {
            return this.$message.error('请填写必要的商品信息！')
          }
          // 发起添加商品的请求操作
          // 用lodash对this.addForm做一层深拷贝  cloneDeep(value)
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs
          console.log(form, 234);
          const { data: res } = await this.$http.post('goods', form)
          if(res.meta.status !== 201) {
            return this.$message.error('添加商品失败！')
          }
          this.$message.success('添加商品成功！')
          this.$router.push('/goods')
        })
      }
    },
    computed: {
      // 获取三级分类的id
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
  .el-steps {
    margin-top: 15px;
    margin-bottom: 20px;
  }
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .imageWidth {
    width: 100%;
  }
  .btnAdd {
    margin-top: 15px;
  }
</style>