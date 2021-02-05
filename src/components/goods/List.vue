<template>
  <div>
    <!-- 面包屑导航栏区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 商品搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="8">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="goodsList" stripe style="width: 100%; font-size: 12px;" border>
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="650"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量(kg)" width="100"></el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
       <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
       :page-sizes="[10, 20, 30, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
       </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'List',
    data() {
      return {
        // 获取到的商品列表数据
        goodsList: [],
        // 查询商品参数
        queryInfo: {
          // 输入的查询条件
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        // 总数据条数
        total: 0
      }
    },
    created() {
      this.getGoodsList()
    },
    methods: {
      // 获取商品列表
      async getGoodsList() {
        const {data: res} = await this.$http.get('goods',{ params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败！')
        }
        console.log(res.data);
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      // 监听商品列表size的变化
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        // 重新获取商品列表
        this.getGoodsList()
      },
      // 监听商品列表num的变化
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum
        // 重新获取商品列表
        this.getGoodsList()
      },
      // 通过id删除商品
      async removeById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult === 'cancel') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败！')
        }
        this.$message.success('删除商品成功！')
        this.getGoodsList()
      },
      // 监听点击添加商品按钮事件
      goAddPage() {
        this.$router.push('/goods/add')
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