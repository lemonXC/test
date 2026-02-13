<template>
  <div class="security-page">
    <van-nav-bar title="账号安全" left-text="返回" left-arrow @click-left="$router.go(-1)" />

    <div class="page-content">
      <div class="card">
        <!-- <div class="card-header">
          <van-icon name="shield-o" />
          <span>安全中心</span>
        </div> -->
        <van-cell-group>
          <van-cell
            title="修改手机号"
            label="更换或绑定手机，用于登录与通知"
            icon="phone-o"
            is-link
            @click="goChangePhone"
          />
          <van-cell
            title="修改密码"
            label="定期更换密码，提升账户安全"
            icon="lock"
            is-link
            @click="goChangePassword"
          />
        </van-cell-group>
      </div>
    </div>
  </div>
 </template>

 <script setup>
 import { useRouter } from 'vue-router'

 const router = useRouter()

 const goChangePhone = () => {
   router.push('/account/change-phone')
 }

 const goChangePassword = () => {
   router.push('/change-password')
 }
 </script>

 <style scoped>
 .security-page {
   min-height: 100vh;
   background: #f7f8fa;
 }

 .page-content {
   padding: 16px;
 }

 .card {
   background: #fff;
   border-radius: 12px;
   box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
   overflow: hidden;
 }

 .card-header {
   display: flex;
   align-items: center;
   gap: 8px;
   padding: 12px 16px;
   border-bottom: 1px solid #f0f0f0;
   color: #323233;
   font-weight: 500;
 }

 :deep(.van-cell) {
   transition: background-color 0.2s ease;
 }

 :deep(.van-cell):hover {
   background-color: #f7f8fa;
 }
 </style>