<!--  -->
<template>
<div>
   <!-- 面包屑导航区域 -->
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <!-- 警告区域 -->
    <el-alert title="注意：只允许为第三级分类设置相关参数" :closable="false" show-icon type="warning"></el-alert>
    <!-- 选择商品分类区域 -->
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类：</span>
        <!-- 选择商品分类的级联选择框 -->
        <el-cascader
        v-model="selectedCateKeys"
        :options="catelist"
        @change="handleChange" expand-trigger="hover" :props="cateProps"> 
        </el-cascader>
      </el-col>
    </el-row>
    <!-- tab页签 -->
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <!-- 添加动态参数的面板 -->
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" size="mini" :disabled="isBtnDislogabled" @click="addDialogVisible = true">添加参数</el-button>
        <!-- 动态参数表格 -->
        <el-table :data="manyTableData" border stripe>
          <!-- 展开行 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 循环渲染tag标签 -->
              <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
              <!-- 输入文本框 -->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)" 
              >
              </el-input>
              <!-- 添加的按钮 -->
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 添加静态属性的面板 -->
      <el-tab-pane label="静态属性" name="only">  
        <el-button type="primary" size="mini" :disabled="isBtnDislogabled" @click="addDialogVisible = true">添加属性</el-button>
        <!-- 静态属性表格 -->
        <el-table :data="onlyTableData" border stripe>
          <!-- 展开行 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 循环渲染tag标签 -->
              <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
              <!-- 输入文本框 -->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)" 
              >
          </el-input>
              <!-- 添加的按钮 -->
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="属性名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
  <!-- 添加参数的对话框 -->
  <el-dialog
    :title="'添加' + titleText"
    :visible.sync="addDialogVisible"
    width="50%" @close="addDialogClosed">
    <!-- 添加参数对话框 -->
    <el-form ref="addFormRef" :model="addForm" :rules="addFormReules" label-width="100px">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="addForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary"  @click="addParams">确 定</el-button>
    </span>
  </el-dialog>
  <!-- 修改参数对话框 -->
  <el-dialog
    :title="'修改' + titleText"
    :visible.sync="editDialogVisible"
    width="50%" @close="editDialogClosed">
    <!-- 添加参数对话框 -->
    <el-form ref="editFormRef" :model="editForm" :rules="editFormReules" label-width="100px">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="editForm.attr_name"></el-input>
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
  components: {},
  data() {
    return {
      catelist:[],
      cateProps:{
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      selectedCateKeys:[],
      activeName:'many',
      manyTableData:[],
      onlyTableData:[],
      addDialogVisible:false,
      addForm:{
        attr_name:''
      },
      addFormReules:{
        attr_name:[{required:true,message:'请输入参数名称',trigger:'blur'}]
      },
      editDialogVisible:false,
      editForm:{},
      editFormReules:{
        attr_name:[{required:true,message:'请输入参数名称',trigger:'blur'}]
      },
      inputVisible:false,
      inputValue:''
    };
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const {data:res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.catelist = res.data
    },
    handleChange() {
      this.getParamsData()
    },
    handleTabClick() {
      this.getParamsData()
    },
    //获取参数列表数据
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //根据所选分类的id和当前所处的面板获取对应的参数
      const {data:res} =  await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {data:res} =  await this.$http.post(`categories/${this.cateId}/attributes`,{attr_name:this.addForm.attr_name,attr_sel:this.activeName})
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    async showEditDialog(attr_id) {
      console.log(attr_id)
      
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName}})
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
      this.$refs.editFormRef.validate( async valid => {
        if (!valid) {
          return 
        }
        const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{attr_name:this.editForm.attr_name,attr_sel:this.activeName})
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    async removeParams(attr_id) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续？','提示',{
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消')
      const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData( )
    },
    //文本失去焦点了，或摁下了Enter都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //发起请求保存这次操作
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{attr_name:row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join(' ')})
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    showInput(row) {
      row.inputVisible = true
      //让文本框自动获得焦点
      //$nextTick 当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose(i,row) {
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    //如果按钮需要被禁用，则返回ture,否正返回false
    isBtnDislogabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
      // this.selectedCateKeys.length !== 3 ? true : false
    },
    //当前选中的三级分类id
    cateId() {
       if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
      // this.selectedCateKeys.length === 3 ? this.selectedCateKeys[2] : null
    },
    //动态计算标题
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang='less' scoped>
.cat_opt {
  margin: 15px;
}
.el-card {
  margin-top: 20px;
}
.el-tag {
  margin: 15px;
}
.input-new-tag {
  width: 120px;
}
</style>