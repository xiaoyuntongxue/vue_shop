<template>
  <div>
    <!-- 面包屑导航栏区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 订单搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="ordersList" stripe style="width: 100%; font-size: 12px;" border>
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="650"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAddress()"></el-button>
            <!-- 定位按钮 -->
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress()"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
       <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
       :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
       </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader style="width: 100%;" v-model="editForm.address1" :options="orderOptions" :props="orderProps"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import cityData from './citydata'

  export default {
    name: 'List',
    data() {
      return {
        // 获取到的订单列表数据
        ordersList: [],
        // 查询商品参数
        queryInfo: {
          // 输入的查询条件
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        // 总数据条数
        total: 0,
        // 控制修改对话框的显示与隐藏
        editDialogVisible: false,
        // 编辑对话框的字段内容
        editForm: {
          // 省市区/县
          address1: [],
          // 详细地址
          address2: ''
        },
        // 编辑对话框表单验证规则
        editRules: {
          address1: [
            { required: true, message: '请输入省市区/县', trigger: 'blur' }
          ],
          address2: [
            { required: true, message: '请输入详细地址', trigger: 'blur' }
          ]
        },
        // 省市区/县级联选择器数据
        orderOptions: cityData,
        orderProps: {
          expandTrigger: 'hover'
        },
        // 控制物流进度对话框的显示与隐藏
        progressVisible: false,
        // 获取到的物流进度数据
        progressInfo: [
          {
            time: '2020-02-04 15:00',
            context: '【园区跨塘分部】'
          },
          {
            time: '2020-02-04 22:01',
            context: '【无锡分拨集货点】'
          },
          {
            time: '2020-02-04 22:58',
            context: '【无锡转运中心】，正发往【南京转运中心】'
          },
          {
            time: '2020-02-05 02:39',
            context: '到【南京转运中心】'
          },
          {
            time: '2020-02-05 02:54',
            context: '【南京转运中心】，正发往【南京江宁区六部】'
          },
          {
            time: '2020-02-05 09:28',
            context: '到【南京江宁区六部】'
          }
        ],
        reverse: true
      }
    },
    created() {
      this.getOrdersList()
    },
    methods: {
      // 获取订单列表数据
      async getOrdersList() {
        const {data: res} = await this.$http.get('orders', { params: this.queryInfo })
        console.log(res, 86);
        if(res.meta.status !== 200) {
          return this.$message.error('获取订单列表数据失败！')
        }
        this.ordersList = res.data.goods
        this.total = res.data.total
      },
      // 监听订单列表size的变化
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getOrdersList()
      },
      // 监听订单列表num的变化
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum
        this.getOrdersList()
      },
      // 点击编辑，展示修改地址对话框
      editAddress() {
        this.editDialogVisible = true
      },
      // 监听编辑地址对话框关闭事件
      editDialogClose() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击展示物流进度
      async showProgress() {
        // 请求物流进度信息数据(无法请求)
        // const {data: res } = await this.$http.get('/kuaidi/804909574412544580')
        // if(res.meta.status !== 200) {
        //   return this.$message.error('获取物流进度失败！')
        // }
        // console.log(res, 161);
        // this.progressInfo = res.data
        this.progressVisible = true
      }
    }

  }
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
  .el-table {
    margin: 15px 0;
  }
</style>