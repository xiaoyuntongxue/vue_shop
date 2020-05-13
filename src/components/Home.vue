<template>
  <!-- 主页整体部分 -->
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <span>电商后台管理系统</span>
      </div> 
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 左侧侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 实现侧边栏折叠效果 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" 
        :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <!-- 利用两个for循环渲染数据，index为唯一的字符串，key是唯一的 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'Home',
    data() {
      return {
        menulist: [],
        iconsObj: {
          '125': 'icon el-icon-user-solid',
          '103': 'icon el-icon-s-cooperation',
          '101': 'icon el-icon-s-shop',
          '102': 'icon el-icon-s-order',
          '145': 'icon el-icon-s-marketing'
        },
        // 控制侧边栏的折叠
        isCollapse: false,
        // 控制二级菜单文字是否高亮
        activePath: ''
      }
    },
    created() {
      // 获取菜单列表
      this.getMenuList();
      // 控制二级菜单高亮
      this.activePath = window.sessionStorage.getItem('activePath');
    },
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push('/login')
      },
      // 获取菜单列表
      async getMenuList() {
        const {data: res} = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error('获取菜单列表失败')
        // 将获取到的菜单数据赋值到menulist中
        this.menulist = res.data;
        // console.log(res,'Home组件，83');
      },
      // 控制侧边栏的折叠
      toggleCollapse() {
        this.isCollapse = !this.isCollapse;
      },
      // 控制高亮链接始终被激活
      saveNavState(activePath) {
        window.sessionStorage.setItem('activePath', activePath);
        this.activePath = activePath;
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    display: flex;
    justify-content: space-between;
    background-color: #373d41;
    align-items: center;
    color: #fff;
    font-size: 20px;
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }
  .toggle-button {
    background-color: #4a5064;
    text-align: center;
    line-height: 24px;
    color: #fff;
    font-size: 10px;
    letter-spacing: 0.2rem;
    cursor: pointer;
  }
  .icon {
    margin-right: 10px;
  }
  .el-main {
    background-color: #eaedf1;
  }
</style>